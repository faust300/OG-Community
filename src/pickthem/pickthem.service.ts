import { Injectable } from '@nestjs/common';
import { OkPacket } from 'mysql2';
import SQL, { SQLStatement } from "sql-template-strings";
import { ConnectionService } from '../extensions/services/connection.service';
import { CreateStageDto } from './dto/create-stage.dto';
import { PickThemElixir, PickThemElixirObj, ReferralElixir } from './entity/elixir.entity';
import { PickThem } from './entity/pickThem.entity';
import { PickthemEntryUser } from './entity/pickThemEntryUser.entity';
import { PickThemStage } from './entity/pickThemStage.entity';
import { PickThemStageBetting } from './entity/pickThemStageBetting.entity';
import { PickThemCoinData, PickThemStageCoin } from './entity/pickThemStageCoin.entity';
import { PickThemSurvey } from './entity/pickThemSurvey.entity';
import { PickThemPreEnterUser } from './entity/pre-enter.entity';
import { PickThemPrediction } from './entity/prediction.entity';

@Injectable()
export class PickthemService {
  constructor(
    private readonly connectionService: ConnectionService,
  ){}

  async getOpenPickThem(){
    const pickThem = await this.connectionService.connectionPool.readerQuerySingle<PickThem>(SQL`
      SELECT
        PT.id AS pickThemId,
        PT.name,
        PT.description,
        PT.startDate,
        PT.endDate,
        PT.maxCrystal,
        PT.goalStreak,
        IF(UNIX_TIMESTAMP(PT.startDate) < UNIX_TIMESTAMP(NOW()), IF(UNIX_TIMESTAMP(NOW()) < UNIX_TIMESTAMP(PT.endDate), TRUE, FALSE), FALSE) AS isParticipable,
        PT.createdAt,
        PT.updatedAt
      FROM
        PickThem AS PT
      WHERE
        PT.deletedAt IS NULL
        AND PT.isActive = 1
      LIMIT 1
    `);

    if(pickThem){
      pickThem.isParticipable = Boolean(pickThem.isParticipable);

      return pickThem;
    }

    return undefined;
  }

  async getUserByUserId(pickThemId: number, userId: number): Promise<PickthemEntryUser | undefined>{
    const user = await this.connectionService.connectionPool.readerQuerySingle<PickthemEntryUser>(SQL`
      SELECT
        id,
        streak,
        count
      FROM
        PickThemEntryUser
      WHERE
        userId = ${userId}
        AND pickThemId = ${pickThemId}
        AND deletedAt IS NULL
    `);

    return user;
  }

  async preEnterPickThem(userId: number): Promise<PickThemPreEnterUser | undefined> {
    const connection = await this.connectionService.connectionPool.beginTransaction();

    try {
      const preEnter = await this.connectionService.connectionPool.writerQuery<OkPacket>(SQL`
        INSERT INTO
          PickThemPreEnterUser
        (userId, clickCount) VALUES
          (${userId}, 1)
        ON DUPLICATE KEY UPDATE
          clickCount = clickCount + 1
      `);

      if(preEnter.affectedRows > 0){
        const enterUser = await this.connectionService.connectionPool.query<PickThemPreEnterUser[]>(connection, SQL`
          SELECT
            clickCount
          FROM
            PickThemPreEnterUser
          WHERE
            userId = ${userId}
        `);

        if(enterUser.length > 0){
          await this.connectionService.connectionPool.commit(connection);
          connection.release();
          return enterUser[0];
        }
      }

      connection.rollback(() => {
        connection.release();
      });
      return undefined;

    } catch (error) {
      console.log(error);
      connection.rollback(() => {
        connection.release();
      });
      return undefined;
    }
  }

  async joinPickThem(userId: number): Promise<number | undefined> {
    const openedPickThem = await this.getOpenPickThem();
    if(!openedPickThem){
      return undefined;
    }

    const joinPickThem = await this.connectionService.connectionPool.writerQuery<OkPacket>(SQL`
      INSERT INTO
        PickThemEntryUser
      (pickTHemId, userId) VALUES
        (${openedPickThem.pickThemId}, ${userId})
    `);

    if(joinPickThem.affectedRows > 0){
      return openedPickThem.pickThemId;
    }

    return undefined;
  }

  async getMyTodayBetting(userId: number): Promise<PickThemStageBetting>{
    const myTodayBetting = await this.connectionService.connectionPool.readerQuerySingle<PickThemStageBetting>(SQL`
      SELECT
        PB.id AS pickThemStageBettingId,
        PB.pickThemId,
        PB.pickThemStageId,
        PB.userId,
        PB.coinId,
        PB.bettingType,
        PB.createdAt
      FROM
        PickThemStageBetting AS PB
      LEFT JOIN
        PickThemStage AS PS
      ON
        PB.pickThemStageId = PS.id
      WHERE
        NOW() BETWEEN PS.bettingStartDate AND PS.bettingEndDate
        AND PS.deletedAt IS NULL
        AND PB.userId = ${userId}
    `);

    return myTodayBetting;
  }

  // legacy
  async getTodayCoinPriceGapFromSnapshotNChartData(coinIds: Array<string>): Promise<PickThemCoinData[] | undefined>{
    const latestData = await this.connectionService.connectionPool.readerQuery<PickThemCoinData[]>(`
      SELECT
        CDI.marketCapId,
        C.chartDataId AS coinId,
        FROM_UNIXTIME(FLOOR(JSON_EXTRACT(JSON_EXTRACT(C.data->>'$.prices', CONCAT("$[", JSON_LENGTH(C.data->>'$.prices')-1, "]")), '$[0]')/1000)) AS latestDate,
        JSON_EXTRACT(JSON_EXTRACT(C.data->>'$.prices', CONCAT("$[", JSON_LENGTH(C.data->>'$.prices')-1, "]")), '$[1]') AS latestPrice
      FROM
        OG_COMMUNITY.ChartData AS C
      LEFT JOIN
        ChartDataId AS CDI
      ON
        C.chartDataId = CDI.id
      WHERE
        C.chartDataId IN (${coinIds.map(id => `'${id}'`).join(",")})
        AND C.period = '24H'
    `, []);

    const startData = await this.connectionService.connectionPool.readerQuery<PickThemCoinData[]>(`
      SELECT
        marketCapId,
        date AS startDate,
        price AS startPrice
      FROM
        OG_COMMUNITY.CryptoSnapshot
      WHERE
        marketCapId IN
          (
            SELECT
              marketCapId
            FROM
              OG_COMMUNITY.ChartDataId
            WHERE
              id IN (${coinIds.map(id => `'${id}'`).join(",")})
          )
      AND date = DATE_FORMAT(CURDATE(), '%Y-%m-%d %H:00:00')
    `, []);

    const result = [];

    for(let i=0; i<latestData.length; i++){
      for(let j=0; j<startData.length; j++){
        if(latestData[i].marketCapId === startData[j].marketCapId){

          result.push({
            coinId: latestData[i].coinId,
            marketCapId: latestData[i].marketCapId,
            startDate: startData[j].startDate,
            startPrice: Number(startData[j].startPrice),
            latestDate: latestData[i].latestDate,
            latestPrice: latestData[i].latestPrice,
          });

          break;
        }
      }
    }

    return result;
  }

  async getTodayCoinPriceGapFromChartData(coinIds: Array<string>): Promise<PickThemCoinData[] | undefined>{
    const priceData = await this.connectionService.connectionPool.readerQuery<PickThemCoinData[]>(SQL`
      SELECT
        CDI.id AS coinId,
        CDI.marketCapId,
        PTS.bettingStartDate AS startDate,
        PTSR.beforePrice AS startPrice,
        CDI.currency AS latestPrice,
        NOW() AS latestDate
      FROM
        PickThem AS PT
      LEFT JOIN
        PickThemStage AS PTS
      ON
        PT.id = PTS.pickThemId
      LEFT JOIN
        PickThemStageResult AS PTSR
      ON
        PTS.id = PTSR.pickThemStageId
      LEFT JOIN
        OG_COMMUNITY.ChartDataId AS CDI
      ON
        PTSR.coinId = CDI.id
      WHERE
        (NOW() BETWEEN PT.startDate AND PT.endDate) AND
        (NOW() BETWEEN PTS.bettingStartDate AND PTS.bettingEndDate) AND
        PTSR.coinId IN (${coinIds})
      ORDER BY
        PTSR.id ASC
    `)

    return priceData;
  }

  // legacy
  async getTodayCoinPriceGapFromSnapshot(coinIds: Array<string>): Promise<PickThemCoinData[] | undefined> {
    const coinDatas = await this.connectionService.connectionPool.readerQuery<PickThemCoinData[]>(`
      SELECT
        id AS coinId,
        marketCapId
      FROM
        OG_COMMUNITY.ChartDataId
      WHERE
        id IN (${coinIds.map(id => `'${id}'`).join(",")})
    `, []);
    if(coinDatas.length === 0){
      return undefined;
    }

    const marketCapIds = coinDatas.map(data => data.marketCapId);

    const priceSql = SQL``;

    marketCapIds.forEach(((id: number, idx: number) => {
      if(idx !== 0){
        priceSql.append(SQL`
          UNION ALL
        `)
      } // Todo: Remove OG_COMMUNITY.CryptoSnapshot
      priceSql.append(SQL`
        SELECT
          START.marketCapId,
          START.startDate,
          START.startPrice,
          LATEST.latestDate,
          LATEST.latestPrice
        FROM
          (
            (
              SELECT
                marketCapId,
                date AS startDate,
                price AS startPrice
              FROM
                OG_COMMUNITY.CryptoSnapshot
              WHERE
                marketCapId = ${id}
              AND date = DATE_FORMAT(CURDATE(), '%Y-%m-%d %H:00:00')
              LIMIT 1
            ) AS START,
            (
              SELECT
                marketCapId,
                date AS latestDate,
                price AS latestPrice
              FROM
                OG_COMMUNITY.CryptoSnapshot
              WHERE
                marketCapId = ${id}
                AND DATE_FORMAT(date, '%Y-%m-%d') = CURDATE()
              ORDER BY date DESC
              LIMIT 1
            ) AS LATEST
          )
      `);
    }));

    const price = await this.connectionService.connectionPool.readerQuery<PickThemCoinData[]>(priceSql);

    return price;
  }

  async getTodayStage(): Promise<PickThemStage | undefined> {
    const todayStage = await this.connectionService.connectionPool.readerQuerySingle<PickThemStage>(SQL`
      SELECT
        PS.id AS pickThemStageId,
        PS.pickThemId,
        PS.state,
        PS.bettingStartDate,
        PS.bettingEndDate,
        PS.targetDate,

        UNIX_TIMESTAMP(PS.bettingStartDate) AS bettingStartUTC,
        UNIX_TIMESTAMP(PS.bettingEndDate) AS bettingEndUTC,
        UNIX_TIMESTAMP(NOW()) AS nowUTC,
        IF(UNIX_TIMESTAMP(PS.bettingStartDate) < UNIX_TIMESTAMP(NOW()), IF(UNIX_TIMESTAMP(NOW()) < UNIX_TIMESTAMP(PS.bettingEndDate), TRUE, FALSE), FALSE) AS isParticipable,

        PS.createdAt,
        PS.updatedAt
      FROM
        PickThemStage AS PS
      LEFT JOIN
        PickThem AS P
      ON
        PS.pickThemId = P.id
      WHERE
        NOW() BETWEEN P.startDate AND P.endDate
        AND NOT PS.state = 'end'
        AND IFNULL(PS.state = 'ongoing', PS.state = 'wait')
        AND P.deletedAt IS NULL
        AND PS.deletedAt IS NULL
    `);

    if(todayStage){
      todayStage.isParticipable = Boolean(todayStage.isParticipable);

      return todayStage;
    }

    return undefined;
  }

  async getPickedCoin(pickThemStageId: number, userId: number): Promise<PickThemStageCoin>{
    const pickedCoin = await this.connectionService.connectionPool.readerQuerySingle<PickThemStageCoin>(SQL`
      SELECT
        PB.coinId,
        T.name,
        T.subTitle AS symbol,
        T.iconPath,
        PB.bettingType AS position
      FROM
        PickThemStageBetting AS PB
      LEFT JOIN
        TopicTags AS T
      ON
        PB.coinId = T.chartDataId
      WHERE
        PB.pickThemStageId = ${pickThemStageId}
        AND PB.userId = ${userId}
    `);

    return pickedCoin;
  }

  async getPickedCoinInfo(pickThemStageId: number, coinId: string):Promise<any>{
    const opinions = await this.connectionService.connectionPool.readerQuerySingle<any>(SQL`
      SELECT

      TopicTags.name,
      COUNT(postId) AS count

      FROM

      Tag

      LEFT JOIN

      TopicTags

      ON Tag.name = TopicTags.name

      LEFT JOIN

      Post

      ON

      Tag.postId = Post.id

      WHERE
        TopicTags.chartDataId = ${coinId}
        AND NOT Tag.userId = 0
        AND Post.deletedAt IS NULL
    `);

    const peopleChoose = await this.connectionService.connectionPool.readerQuery<any[]>(SQL`
      SELECT
        bettingType,
        COUNT(id) AS count
      FROM
        PickThemStageBetting
      WHERE
        pickThemStageId = ${pickThemStageId}
      GROUP BY
        bettingType
    `);

    const url = await this.connectionService.connectionPool.readerQuerySingle<any>(SQL`SELECT url FROM PickThemStageCoin WHERE pickThemStageId = ${pickThemStageId} AND coinId = ${coinId}`);

    return {
      opinions,
      url: url?.url,
      peopleChoose: peopleChoose.reduce((prev: any, cur: any) => {
        if(cur['bettingType'] === 'up'){
          prev['up'] = cur['count']
        } else{
          prev['down'] = cur['count']
        }

        return prev;
      }, {})
    }
  }

  async getTodayCoinsByStageId(pickThemStageId: number): Promise<PickThemStageCoin[]>{
    const todayCoins = await this.connectionService.connectionPool.readerQuery<PickThemStageCoin[]>(SQL`
        SELECT
          PC.coinId,
          T.name,
          T.subTitle AS symbol,
          T.iconPath,
          NULL AS position
        FROM
          PickThemStageCoin AS PC
        LEFT JOIN
          TopicTags AS T
        ON
          PC.coinId = T.chartDataId
        WHERE
          PC.pickThemStageId = ${pickThemStageId}
          AND T.deletedAt IS NULL
        ORDER BY
          PC.id ASC
      `);

    return todayCoins;
  }

  async createBet(pickThemId: number, pickThemStageId: number, createStageDto: CreateStageDto, userId: number): Promise<Boolean>{
    const create = await this.connectionService.connectionPool.writerQuery<OkPacket>(SQL`
      INSERT INTO
        PickThemStageBetting
      (pickThemId, pickThemStageId, userId, coinId, bettingType) VALUES
        (${pickThemId}, ${pickThemStageId}, ${userId}, ${createStageDto.coinId}, ${createStageDto.bettingType})
    `);
    if(create.affectedRows > 0)
      return true;
    return false;
  }

  async getMyPrediction(pickThemId: number, userId: number): Promise<any>{
    const elixir = await this.connectionService.connectionPool.readerQuery<PickThemElixir[]>(SQL`
      SELECT
        PE.name,
        PE.description,
        PE.point,
        PE.multiply
      FROM
        PickThemUserElixir AS PUE
      RIGHT JOIN
        PickThemElixir AS PE
      ON
        PUE.PickThemElixirId = PE.id
      WHERE
        PE.isActive = 1
        AND PE.pickThemId = ${pickThemId}
        AND PUE.userId = ${userId}
    `);

    const userInfo = await this.connectionService.connectionPool.readerQuerySingle<any>(SQL`
      SELECT
        streak,
        count
      FROM
        PickThemEntryUser
      WHERE
        deletedAt IS NULL
        AND userId = ${userId}
        AND pickThemId = ${pickThemId}
    `);

    const prediction = await this.connectionService.connectionPool.readerQuery<PickThemPrediction[]>(SQL`
      SELECT
        PS.id AS pickThemStageId,
        PS.state,
        PB.coinId,
        T.name,
        T.subTitle AS symbol,
        T.iconPath,
        PB.isHit,
        PB.bettingType,
        PR.answer,
        PR.beforePrice,
        PR.afterPrice,
        DATE_FORMAT(PS.bettingStartDate, '%Y-%m-%d') AS bettingStartDate,
        PS.targetDate
      FROM
        PickThemStage AS PS
      LEFT JOIN
        PickThemStageBetting AS PB
      ON
        PS.id = PB.pickThemStageId
        AND PB.userId = ${userId}
      LEFT JOIN
        PickThemStageResult AS PR
      ON
        PR.pickThemStageId = PS.id
        AND PR.coinId = PB.coinId
      LEFT JOIN
        TopicTags AS T
      ON
        T.chartDataId = PB.coinId
      WHERE
        PS.pickThemId = ${pickThemId}
        AND PS.deletedAt IS NULL
      ORDER BY
        PS.id ASC
    `);

    return {
      elixir,
      streak: userInfo.streak,
      prediction,
    }
  }

  async getMyStatus(pickThemId: number, userId: number): Promise<any>{
    const elixir = await this.connectionService.connectionPool.readerQuery<PickThemElixir[]>(SQL`
      SELECT
        PE.name,
        PE.description,
        PE.point,
        PE.multiply
      FROM
        PickThemUserElixir AS PUE
      RIGHT JOIN
        PickThemElixir AS PE
      ON
        PUE.PickThemElixirId = PE.id
      WHERE
        PE.isActive = 1
        AND PE.pickThemId = ${pickThemId}
        AND PUE.userId = ${userId}
    `);

    const userInfo = await this.connectionService.connectionPool.readerQuerySingle<any>(SQL`
      SELECT
        streak,
        count
      FROM
        PickThemEntryUser
      WHERE
        deletedAt IS NULL
        AND userId = ${userId}
        AND pickThemId = ${pickThemId}
    `);

    let crystals = Math.pow(2, userInfo.count);
    if(elixir.length > 0){
      crystals = crystals * Math.pow(2, elixir.length);
    }

    return {
      streak: userInfo.streak,
      crystals,
    }
  }

  async getMyElixir(pickThemId: number, userId: number): Promise<PickThemElixir[]>{
    const elixir = await this.connectionService.connectionPool.readerQuery<PickThemElixir[]>(SQL`
        SELECT
          PE.name,
          PE.description,
          PE.point,
          PE.multiply
        FROM
          PickThemElixir AS PE
        LEFT JOIN
          PickThemUserElixir AS PUE
        ON
          PUE.pickThemElixirId = PE.id
        WHERE
          PE.isActive = 1
          AND PE.pickThemId = ${pickThemId}
          AND PUE.pickThemId = ${pickThemId}
          AND PUE.userId = ${userId}
    `);

    return elixir;
  }

  async getMyElixirDetail(pickThemId: number, userId: number): Promise<any>{
    const elixir = await this.connectionService.connectionPool.readerQuery<PickThemElixir[]>(SQL`
      SELECT
        PE.name,
        PE.description,
        PE.point,
        PE.multiply,
        PE.goal,
        IF(PUE.id > 0, 1,0) AS elixirCheck,
        0 AS referralCount,
        0 AS popularCount
      FROM
        PickThemElixir AS PE
      LEFT JOIN
        PickThemUserElixir AS PUE
      ON
        PE.id = PUE.pickThemElixirId AND PUE.pickThemId = ${pickThemId} AND PUE.userId = ${userId}
      WHERE
        PE.isActive = 1
        AND PE.pickThemId = ${pickThemId};
    `);

    const elixirReferralCount = await this.connectionService.connectionPool.readerQuerySingle<ReferralElixir>(SQL`
    SELECT
      COUNT(id) AS count
    FROM
      UserReferralHistory
    WHERE
      referralCode =
        (
          SELECT
            referralCode
          FROM
            User
          WHERE
            id = ${userId}
        )
      AND createdAt > (SELECT startDate FROM PickThem WHERE id = ${pickThemId})
    `)

    if(elixir.length === 0){
      return {
        referral: {
          has: false,
          count: elixirReferralCount.count,
          goal: 2,
        },
        popular: {
          has: false,
          count: 0,
          goal: 1,
        },
        survey: {
          has: false,
          count: 0,
          goal: 1
        }
      };
    } else {
      let result = {};

      elixir.map(item => {
        result[item.name] = {
          has: Boolean(item.elixirCheck),
          count: item.name === 'referral' ? elixirReferralCount.count : item.elixirCheck,
          goal: item.goal
        }
      })

      return result;
    }
  }

  async getCrystalAnimation(userId: number): Promise<boolean> {
    try {

      const sql = SQL`
      SELECT
        isShow
      FROM
        PickThemSurvey
      WHERE
        userId = ${userId}
      `;

      const result = await this.connectionService.connectionPool.readerQuerySingle<PickThemSurvey>(sql);

      if ( ! result) return false;

      if ( ! result.isShow) {
        const updateSql = SQL`
        UPDATE PickThemSurvey
        SET isShow = 1
        WHERE
          userId = ${userId};
        `;

        this.connectionService.connectionPool.writerQuery(updateSql);
      }

      // true -> user show animation / false -> user not show animation
      return ! Boolean(result.isShow);
    } catch (e) {
      console.log(e);
    }

    return true;
  }



}
