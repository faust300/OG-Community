import { Post } from "src/post/entities/post.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, Relation, Unique } from "typeorm";

@Entity({name: 'Tag'})
export class Tag {
    
    @PrimaryColumn()
    postId: number;

    @Column({unique: true})
    userId: number;

    @Column()
    name: string;

    @ManyToOne(() => Post, Post => Post.tag)
    @JoinColumn({name: 'postId'})
    post: Post;

    label: string;
    count?: number;

}

export class TopicTags {
    name: string;
    subTitle: string;
    iconPath: string;
}

