import { Injectable } from '@nestjs/common';
import { OGException } from '../extensions/exception/exception.filter';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { isEmpty } from 'src/utils/IsEmpty';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, MoreThan, Repository } from 'typeorm';
import { Widget } from './entities/widget.entity';
import { WidgetUserDefined } from './entities/widgetUserDefined.entity';
import { WidgetDefaultDefined } from 'src/widgets/entities/widgetDefaultDefined.entity';
import { WidgetDTO } from './dto/widget.dto';

@Injectable()
export class WidgetsService {
  constructor(
    @InjectRepository(Widget)
    private readonly widgetRepository: Repository<Widget>,

    @InjectRepository(WidgetUserDefined)
    private readonly widgetUserDefinedRepository: Repository<WidgetUserDefined>,

    private readonly dataSource: DataSource,
  ) { }

  async getUserWidgetSettings(userId: number): Promise<any> {
    try {
      const result = await this.widgetUserDefinedRepository.findBy({ userId })

      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async getWidgetsAll(lang: string, userId: number): Promise<WidgetDTO[]> {
    try {
      const result = await this.widgetRepository.find({
        relations: {
          defaultSetting: true
        }
      });

      const user = await this.getUserWidgetSettings(userId);

      return result.map(widget => {
        // user setting set
        const defined = user.filter(defined => defined.widgetId == widget.id);
        
        if (defined && defined.length == 1) {
          widget.userSetting = defined
        }

        const returnObj = widget.convertWidgetDTO(widget, lang);

        return returnObj;
      });
    } catch (e) {
      throw new OGException(
        {
          errorCode: -30101,
          errorMessage: 'Widget All Load Failed',
        },
        500,
      );
    }
  }

  async getWidgetsByAnonymous(lang: string): Promise<WidgetDTO[]> {
    try {
      const queryObj = await this.widgetRepository.find({
        relations: {
          defaultSetting: true
        },
        where: {
          defaultSetting: {
            widgetId: MoreThan(0)
          }
        }
      })

      const widgets = queryObj
        .sort((a: Widget, b: Widget) => a.defaultSetting.order - b.defaultSetting.order)
        .map(widget => {
          return widget.convertWidgetDTO(widget, lang);
        });

      return widgets.length == 0 ? [] : widgets;
    } catch (err) {
      throw new OGException(
        {
          errorCode: 30102,
          errorMessage: 'Anonymous Widgets Load Failed',
        },
        500,
      );
    }
  }

  async getWidgetsByUserId(lang: string, userId: number): Promise<WidgetDTO[]> {
    try {

      const queryObj = await this.widgetRepository.find({
        relations: {
          userSetting: true
        },
        where: {
          userSetting: {
            userId
          }
        }
      })

      const widgets = queryObj
        .sort((a: Widget, b: Widget) => a.userSetting[0].order - b.userSetting[0].order)
        .map(widget => {
          return widget.convertWidgetDTO(widget, lang)
        })

      return widgets.length == 0 ? await this.getWidgetsByAnonymous('EN') : widgets;
    } catch (err) {
      throw new OGException(
        {
          errorCode: -30103,
          errorMessage: 'User Widgets Load Failed',
        },
        500,
      );
    }
  }

  async updateWidgetUserDefinedByUserId(userId: number,
    updateWidgetsDtos: UpdateWidgetDto[],
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner("master");

    await queryRunner.connect();

    const user = await queryRunner.query(`
      SELECT
        COUNT(*) AS count
      FROM
        User
      WHERE id = ?;
    `, [userId]);

    // const user = await queryRunner.manager.findOneBy(User, {userId})
  
    if ( ! user) {
      await queryRunner.release();
      return false;
    }

    await queryRunner.startTransaction();
    
    let saveResult;
    try {
      // user defined all delete
      const userDefined = new WidgetUserDefined();
      userDefined.userId = userId;
      await queryRunner.manager.delete(WidgetUserDefined, userDefined);

      // new user defined
      if (updateWidgetsDtos.length > 0) {
        // widget Check
        const targetWidgetIds = updateWidgetsDtos.map(dto => dto.widgetId);
        const targetWidgets = await queryRunner.manager.findBy(Widget, {id: In(targetWidgetIds)});

        const settingToSave: WidgetUserDefined[] = [];

        targetWidgets.map(tw => {

          // widget exists
          const dto = updateWidgetsDtos.filter(dto => dto.widgetId === tw.id)[0];

          if ( ! dto) return false;

          if (tw.setting && tw.setting.length > 0) {
            tw.setting.map(set => {
              if (!this.validator(set, dto.setting)) {
                throw new OGException({
                  errorCode: -30001,
                  errorMessage: 'Invalid widget setting update',
                });
              }
            })
          }

          const saveOne = new WidgetUserDefined();
          saveOne.userId = userId;
          saveOne.widgetId = dto.widgetId;
          saveOne.order = dto.order;
          saveOne.setting = dto.setting;
          
          settingToSave.push(saveOne);
        })

        saveResult = await queryRunner.manager.save(settingToSave);
      }
      await queryRunner.commitTransaction();
    } catch (e) {
      console.log(e);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return true;
  }

  validator(validate: any, val: any): boolean {
    let result = true;

    if (isEmpty(validate)) return true;
    if (!isEmpty(validate) && isEmpty(val)) return false;

    switch (validate.type) {
      case 'number':
        if (val[validate.key].length === 0) result = false;

        val[validate.key].map((v) => {
          if (result) {
            result = typeof v === 'number' || v instanceof Number;
          }
        });
        break;
      case 'string':
        if (val[validate.key].length === 0) result = false;

        val[validate.key].map((v) => {
          if (result) {
            result = typeof v === 'string' || v instanceof String;
          }
        });
        break;
      case 'set':
        if (val[validate.key].length === 0) result = false;

        val[validate.key].map((v) => {
          if (result) {
            result = validate.value.indexOf(v) !== -1;
          }
        });
        break;
      case 'enum':
        if (val[validate.key].length !== 1) result = false;

        val[validate.key].map((v) => {
          if (result) {
            result = validate.value.indexOf(v) !== -1;
          }
        });
        break;
      default:
        result = false;
        break;
    }
    return result;
  }
}
