import { Column, PrimaryColumn, Entity } from 'typeorm';

@Entity('payment_method')
export class PaymentMethodEntity {
  @PrimaryColumn('varchar', { length: 10, nullable: false })
  method: string;

  @Column('varchar', { length: 50, nullable: true })
  description: string;

  @Column('varchar', { length: 2, nullable: true })
  sbc_code?: string;

  constructor(paymentMethod: PaymentMethodEntity) {
    Object.assign(this, paymentMethod);
  }
}
