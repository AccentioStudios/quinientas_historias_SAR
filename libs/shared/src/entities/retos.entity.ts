import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

//import { FriendRequestEntity } from './friend-request.entity';

@Entity('retos')
export class RetosEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column()
  probability: Number;

  @Column()
  required: Boolean;

  @Column()
  active: Boolean;

  @Column()
  triggers: string;

  @Column()
  params: string;

  @Column()
  tournaments: string;

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
