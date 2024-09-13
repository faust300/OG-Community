import { Column, Entity, PrimaryColumn } from "typeorm";
import { TrendKeywordDTO } from "../dto/aggregate.dto";

@Entity('Aggregate')
export class Aggregate {
    
    @PrimaryColumn()
    code: string;

    @Column({type: 'json'})
    value: JSON

    @Column()
    description: string;

    convertTrendKeywordDTO(obj): TrendKeywordDTO {
        delete obj.code;
        delete obj.description;

        return obj;
    }
}
