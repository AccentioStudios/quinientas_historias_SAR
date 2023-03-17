import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

//import { FriendRequestEntity } from './friend-request.entity';

@Entity('retos')
export class RetosEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  reto_name: string;

  @Column()
  url: string;

  @Column()
  probability: Number;

  @Column()
  required: Boolean;

  @Column()
  triggers: string;

  @Column()
  params: string;

  @Column()
  added_by: Number;


/*   @OneToMany(
    () => FriendRequestEntity,
    (friendRequestEntity) => friendRequestEntity.creator,
  )
  friendRequestCreator: FriendRequestEntity[];

  @OneToMany(
    () => FriendRequestEntity,
    (FriendRequestEntity) => FriendRequestEntity.receiver,
  )
  friendRequestReceiver: FriendRequestEntity[]; */
}
