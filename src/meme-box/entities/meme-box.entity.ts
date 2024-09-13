import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MemeBoxDTO } from "../dto/meme-box.dto";

@Entity('MemeBox')
export class MemeBox {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    keyword: string;

    @Column()
    url: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    convertMemeBoxDTO(obj): MemeBoxDTO {
        delete obj.createdAt;
        delete obj.updatedAt;
        delete obj.deletedAt;

        return obj;
    }
}
