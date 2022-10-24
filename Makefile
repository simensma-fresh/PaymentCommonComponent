

# Project
export PROJECT := pcc

# Environment
export ENV_NAME ?= dev

# LZ2 
LZ2_PROJECT = iz8ci7

# Terraform Cloud backend config variables
define TF_BACKEND_CFG
workspaces { name = "$(LZ2_PROJECT)-$(ENV_NAME)" }
hostname     = "app.terraform.io"
organization = "bcgov"
endef
export TF_BACKEND_CFG

# Git
export COMMIT_SHA:=$(shell git rev-parse --short=7 HEAD)
export LAST_COMMIT_MESSAGE:=$(shell git log -1 --oneline --decorate=full --no-color --format="%h, %cn, %f, %D" | sed 's/->/:/')

# Terraform variables
TERRAFORM_DIR = terraform
export BOOTSTRAP_ENV=terraform/bootstrap

define TFVARS_DATA
target_env = "$(ENV_NAME)"
project_code = "$(PROJECT)"
lz2_code = "$(LZ2_PROJECT)"
build_id = "$(COMMIT_SHA)"
build_info = "$(LAST_COMMIT_MESSAGE)"
endef
export TFVARS_DATA

# AWS Environments variables
export AWS_REGION ?= ca-central-1
APP_SRC_BUCKET = $(LZ2_PROJECT)-$(ENV_NAME)-packages

.PHONY: 


# ===================================
# Terraform commands
# ===================================

config:
	@echo "$$TFVARS_DATA" > $(TERRAFORM_DIR)/.auto.tfvars
	@echo "$$TF_BACKEND_CFG" > $(TERRAFORM_DIR)/backend.hcl

init: config
	@terraform -chdir=$(TERRAFORM_DIR) init -input=false \
		-reconfigure \
		-backend-config=backend.hcl -upgrade

plan: init
	@terraform -chdir=$(TERRAFORM_DIR) plan -no-color

apply: init 
	@terraform -chdir=$(TERRAFORM_DIR) apply -auto-approve -input=false

destroy: init
	@terraform -chdir=$(TERRAFORM_DIR) destroy


# ===================================
# Lambda Builds
# ===================================

build:
	@yarn build

deploy-backend: 
	aws lambda update-function-code --function-name csvTransformer --zip-file fileb://./terraform/build/empty_lambda.zip --region $(AWS_REGION) > /dev/null


# ===================================
# Tag Based Deployments
# ===================================

pre-tag:
	@./scripts/check_rebase.sh
	
tag-dev:
	@git tag -fa dev -m "Deploy dev: $(git rev-parse --abbrev-ref HEAD)"
	@git push --force origin refs/tags/dev:refs/tags/dev

tag-test:
	@git tag -fa test -m "Deploy test: $(git rev-parse --abbrev-ref HEAD)"
	@git push --force origin refs/tags/test:refs/tags/test

tag-prod:
ifndef version
	@echo "++\n***** ERROR: version not set.\n++"
	@exit 1
else
	@git tag -fa $(version) -m "IEN release version: $(version)"
	@git push --force origin refs/tags/$(version):refs/tags/$(version)
	@git tag -fa prod -m "Deploy prod: $(version)"
	@git push --force origin refs/tags/prod:refs/tags/prod
endif


# ===================================
# API Build
# ===================================

pre-build:
	@echo "++\n***** Pre-build Clean Build Artifact\n++"
	@rm -rf ./terraform/build || true
	@mkdir -p ./terraform/build
	@echo "++\n*****"

build-api: pre-build
	@echo 'Deleting existing build dir...\n'
	@rm -rf ./.build || true

	@echo "++\n***** Building API for AWS\n++"
	@yarn || yarn workspace @payment/backend build
	@yarn workspaces focus @payment/backend --production
	
	@echo 'Creating build dir...\n' && mkdir -p .build/backend
	@echo 'Copy Node modules....\n' && cp -r node_modules .build/backend
	@echo 'Unlink local packages...\n' && rm -rf .build/backend/node_modules/@payment/*
	@echo 'Copy backend dist build files ...\n' && cp -r apps/backend/dist/* .build/backend
	
	@echo 'Creating Zip ...\n' && cd .build && mkdir pkg && zip -r ./pkg/backend.zip ./backend && cd ..
	@echo "Done!++\n****"

# ===================================
# AWS Deployments
# ===================================

sync-app:
	aws s3 sync ./.build/pkg s3://$(APP_SRC_BUCKET) --delete

# Full redirection to /dev/null is required to not leak env variables
deploy-api:
	aws lambda update-function-code --function-name Payment_Common_Component_API --zip-file fileb://./.build/pkg/backend.zip --region $(AWS_REGION) > /dev/null

deploy-gl:
	aws lambda update-function-code --function-name glGenerator --zip-file fileb://./.build/pkg/backend.zip --region $(AWS_REGION) > /dev/null
