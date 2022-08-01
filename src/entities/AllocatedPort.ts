import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AllocatedPort extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	public readonly port?: number;

	@Column()
	public branch: string;

	@Column()
	public repo: string;

	constructor(
		branch: string,
		repo: string,
	) {
		super();
		this.branch = branch;
		this.repo = repo;
	}
}