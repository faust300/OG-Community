import { Column, Entity, JoinColumn, OneToMany, PrimaryColumn } from "typeorm";
import { ChartData } from "./chart.entitiy";

@Entity("ChartDataId")
export class ChartDataId {

  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column()
  marketCapId: string;

  @Column("bool")
  isChart: boolean;

  @Column("bool")
  isPrice: boolean;

  @Column()
  currency: string;

  @OneToMany(() => ChartData, chartData => chartData.chartDataIdRelation)
  @JoinColumn({name: "id"})
  chartData: ChartData[];
}