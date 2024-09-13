import { ChartDataWidgetDTO } from "src/widget-source/dto/chart-data.dto";
import { Column, Entity, JoinColumn, JoinTable, ManyToOne, PrimaryColumn, Relation, UpdateDateColumn } from "typeorm";
import { ChartDataDTO } from "../dto/chart-data.dto";
import { ChartDataId } from "./chartDataId.entity";

@Entity("ChartData")
export class ChartData {

  @PrimaryColumn()
  chartDataId: string;

  @PrimaryColumn({ enum: ['24H','7D','30D','90D']})
  period: '24H' | '7D' | '30D' | '90D';

  @Column({ type: 'json' })
  data: JSON;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ChartDataId, object => object.chartData)
  @JoinColumn({name: 'chartDataId'})
  chartDataIdRelation: ChartDataId;

  convertChartDataDTO(obj): ChartDataDTO {
    delete obj.chartDataIdRelation;
    delete obj.period;

    return obj;
  }

  convertChartDataWidgetDTO(obj): ChartDataWidgetDTO {
    obj.name = obj.chartDataIdRelation.name;
    obj.symbol = obj.chartDataIdRelation.symbol;
    obj.compare = 'USD';

    delete obj.chartDataIdRelation;
    delete obj.period;

    return obj;
  }
}
