import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryColumn } from "typeorm";

export class ExternalLinks {
  alt: string;
  iconPath: string;
  link: string;
  target: string;
}

export class Extra {
  links: ExternalLinks[];
}

@Entity('Topic')
export class Topic {
  @PrimaryColumn({name: 'name'})
  topic: string;

  @Column()
  type: 'cryptocurrency' | 'nft' | 'normal'

  @Column()
  synonyms: string;

  @Column()
  imagePath: string;

  @Column()
  iconPath: string;

  @Column()
  symbol: string;

  @Column()
  description: string;

  @Column()
  chartDataId: string;

  @Column()
  externalLinks: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
