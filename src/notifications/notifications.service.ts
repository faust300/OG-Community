import { Injectable } from '@nestjs/common';
import { ConnectionService } from 'src/extensions/services/connection.service';
import SQL from 'sql-template-strings';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(private readonly connectionService: ConnectionService) {}

  async getNotificationsFromUserId(userId: number, language: string = 'EN') {
    let notifications = await this.connectionService.connectionPool.readerQuery<
      Notification[]
    >(SQL`
        SELECT * FROM 

        (
          SELECT id AS notificationId ,NULL AS noticeId, code, notificationCode, behaviorData, subject, entities, contents, createdAt, readedAt FROM Notification WHERE userId = ${userId}
          UNION ALL
          SELECT NULL AS notificationId, id AS noticeId, code, notificationCode, behaviorData, subject, entities, contents, createdAt, NULL AS readedAt FROM Notice 
        ) AS T
        
        WHERE createdAt > CURDATE() - INTERVAL 14 DAY GROUP BY notificationCode ORDER BY createdAt DESC;
    `);

    const noticeIds = notifications.reduce((ids, notification) => {
      if (notification.noticeId !== null && notification.readedAt == null) {
        ids.push(notification.noticeId);
      }
      return ids;
    }, new Array<number>());

    const notificationIds = notifications.reduce((ids, notification) => {
      if (
        notification.notificationId !== null &&
        notification.readedAt == null
      ) {
        ids.push(notification.notificationId);
      }
      return ids;
    }, new Array<number>());

    // Copy To notification readedAt
    const connection =
      await this.connectionService.connectionPool.beginTransaction();
    try {
      if (noticeIds.length > 0) {
        await this.connectionService.connectionPool.query(
          connection,
          `INSERT INTO Notification ( code, notificationCode, userId, behaviorData, subject, entities, contents, createdAt, readedAt ) SELECT code, notificationCode, ? AS userId, behaviorData, subject, entities, contents, createdAt, NOW() AS readedAt FROM Notice WHERE Notice.id IN (${noticeIds
            .map(() => '?')
            .join(',')});`,
          [userId, ...noticeIds],
        );
      }
      if (notificationIds.length > 0) {
        await this.connectionService.connectionPool.query(
          connection,
          `UPDATE Notification SET readedAt = CURRENT_TIMESTAMP() WHERE Notification.id IN (${notificationIds
            .map(() => '?')
            .join(',')});`,
          notificationIds,
        );
      }
      await this.connectionService.connectionPool.commit(connection);
      connection.release();
    } catch (e) {
      console.log(e);
      connection.rollback(() => {
        connection.release();
      });
    }

    return notifications.map((notification) => {
      if (notification.subject) {
        try {
          notification.subject = JSON.parse(String(notification.subject))[
            language
          ];
        } catch (e) {
          notification.subject = '';
        }
      }
      if (notification.behaviorData) {
        try {
          notification.behaviorData = JSON.parse(
            String(notification.behaviorData),
          );
        } catch (e) {
          notification.behaviorData = {};
        }
      }
      if (notification.entities) {
        try {
          notification.entities = JSON.parse(String(notification.entities));
        } catch (e) {
          notification.entities = [];
        }
      }

      return {
        code: notification.code,
        behaviorData: notification.behaviorData,
        subject: notification.subject,
        entities: notification.entities,
        contents: notification.contents,
        createdAt: notification.createdAt,
        readedAt: notification.readedAt,
      };
    });
  }
}
