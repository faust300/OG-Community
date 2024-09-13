// import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

// @Entity({name: 'TopicTags'})
// export class TopicTag {
//     @PrimaryGeneratedColumn()
//     id: number;

//     @Column()
//     name: string;

//     @Column()
//     synonyms: string;

//     @Column()
//     symbol: string;

//     @Column()
//     chartDataId: string;

//     @Column()
//     imagePath: string;

//     @Column()
//     iconPath: string;

//     @Column()
//     description: string;

//     @Column({type: 'json'})
//     ExternalLinks: object;

//     @CreateDateColumn()
//     createdAt: Date;

//     @DeleteDateColumn()
//     deletedAt?: Date;
// }