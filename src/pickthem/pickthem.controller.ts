import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { OGRequest } from 'src/extensions/auth/auth.request';
import { JWTAuthGuard } from 'src/extensions/auth/jwt-auth.guard';
import { OGException } from 'src/extensions/exception/exception.filter';
import { UserService } from 'src/user/user.service';
import { CreateStageDto } from './dto/create-stage.dto';
import { Elixir } from './entity/elixir.entity';
import { PickthemService } from './pickthem.service';

@Controller('pickthem')
export class PickthemController {
  constructor(
    private readonly pickthemService: PickthemService,
    private readonly userService: UserService,
  ){}

  // Now opened Pick'em Info
  @Get()
  async getOpenPickThem(){
    return {
      success: true,
      result: await this.pickthemService.getOpenPickThem() ?? null
    }
  }

  @Get('/pre-enter')
  @UseGuards(JWTAuthGuard)
  async preEnterPickThem(@Req() req: OGRequest){
    const {userId} = req.user;

    const enterUser = await this.pickthemService.preEnterPickThem(userId);
    if(!enterUser){
      throw new OGException({
        errorCode: -401,
        errorMessage: 'Internal Server Error.',
      }, 500);
    }

    return {
      success: true,
      result: enterUser.clickCount,
    }

  }

  @Get('/status')
  @UseGuards(JWTAuthGuard)
  async geMyStatus(@Req() req: OGRequest){
    const {userId} = req.user;

    const openedPickThem = await this.pickthemService.getOpenPickThem();
    if(!openedPickThem){
      throw new OGException({
        errorCode: -409,
        errorMessage: 'Event is not available.',
      }, 400);
    }

    const isJoined = await this.pickthemService.getUserByUserId(openedPickThem.pickThemId, userId);
    if(!isJoined){
      return {
        success: true,
        result: {
          isJoined: false,
          ongoingStageId: null,
          crystals: 0,
          streak: 0,
          isPredicted: false,
        },
      }
    }

    const todayStage = await this.pickthemService.getTodayStage();

    const myElixir = await this.pickthemService.getMyElixir(openedPickThem.pickThemId, userId);
    let crystals = Math.pow(2, isJoined.count);
    if(myElixir.length > 0){
      crystals = crystals * Math.pow(2, myElixir.length);
    }

    const getMyTodayBetting = await this.pickthemService.getMyTodayBetting(userId);

    // one time crystal x2 animation
    const surveyShow = await this.pickthemService.getCrystalAnimation(userId);

    return {
      success: true,
      result: {
        isJoined: true,
        ongoingStageId: todayStage ? todayStage.pickThemStageId : null,
        crystals,
        streak: isJoined.streak,
        isPredicted: getMyTodayBetting ? true : false,
        surveyShow: Boolean(surveyShow)
      },
    }

  }

  // Join Pick'em
  @Post('/enter')
  @UseGuards(JWTAuthGuard)
  async joinPickThem(@Req() req: OGRequest){
    const {userId} = req.user;

    const openedPickThem = await this.pickthemService.getOpenPickThem();
    if(!openedPickThem || (openedPickThem && !openedPickThem.isParticipable)){
      throw new OGException({
        errorCode: -409,
        errorMessage: 'Event is not available.',
      }, 400);
    }

    const isJoined = await this.pickthemService.getUserByUserId(openedPickThem.pickThemId, userId);
    if(isJoined){
      throw new OGException({
        errorCode: -408,
        errorMessage: 'Already Joined.',
      }, 400);
    }

    const joinNgetPickThemId = await this.pickthemService.joinPickThem(userId);
    if(!joinNgetPickThemId){
      throw new OGException({
        errorCode: -401,
        errorMessage: 'Internal Server error.',
      }, 500);
    }

    return {
      success: true,
      result: joinNgetPickThemId
    }
  }

  // coin price
  @Get('/stage/coins')
  @UseGuards(JWTAuthGuard)
  async getTodayCoinPriceGap(@Req() req: OGRequest, @Query('coinIds') coinIds: string | string[] = undefined){
    const {userId} = req.user;

    const openedPickThem = await this.pickthemService.getOpenPickThem();
    if(!openedPickThem || (openedPickThem && !openedPickThem.isParticipable)){
      throw new OGException({
        errorCode: -409,
        errorMessage: 'Event is not available.',
      }, 400);
    }

    const isJoined = await this.pickthemService.getUserByUserId(openedPickThem.pickThemId, userId);
    if(!isJoined){
      throw new OGException({
        errorCode: -407,
        errorMessage: 'Not Joined User.',
      }, 400);
    }

    if(!coinIds){
      throw new OGException({
        errorCode: -402,
        errorMessage: 'Invalid Access.',
      }, 400);
    }

    if(typeof coinIds === 'string'){
      coinIds = [coinIds];
    }

    const todayStage = await this.pickthemService.getTodayStage();
    if(!todayStage){
      throw new OGException({
        errorCode: -402,
        errorMessage: 'Invalid Access.',
      }, 400);
    }
    const todayCoins = await this.pickthemService.getTodayCoinsByStageId(todayStage.pickThemStageId);
    for(let i=0; i<coinIds.length; i++){
      if(!todayCoins.map(coin => coin.coinId).includes(coinIds[i])){
        throw new OGException({
          errorCode: -410,
          errorMessage: 'Invalid Coin.',
        }, 400);
      }
    }

    const getTodayCoinPriceGap = await this.pickthemService.getTodayCoinPriceGapFromChartData(coinIds);
    if(!getTodayCoinPriceGap){
      throw new OGException({
        errorCode: -402,
        errorMessage: 'Invalid Access.',
      }, 400);
    }

    return {
      success: true,
      result: getTodayCoinPriceGap
    }
  }

  // Choose one topic in today's stage & See my pick
  @Get('/stage')
  @UseGuards(JWTAuthGuard)
  async getTodayStage(@Req() req: OGRequest){
    const {userId} = req.user;

    const openedPickThem = await this.pickthemService.getOpenPickThem();
    if(!openedPickThem || (openedPickThem && !openedPickThem.isParticipable)){
      throw new OGException({
        errorCode: -409,
        errorMessage: 'Event is not available.',
      }, 400);
    }

    const isJoined = await this.pickthemService.getUserByUserId(openedPickThem.pickThemId, userId);
    if(!isJoined){
      throw new OGException({
        errorCode: -407,
        errorMessage: 'Not Joined User.',
      }, 400);
    }

    const todayStage = await this.pickthemService.getTodayStage();
    if(!todayStage){
      return {
        success: true,
        result: {
          stage: null,
          chosen: null,
          coin: null,
        }
      }
    }

    const isBetToday = await this.pickthemService.getMyTodayBetting(userId);
    if(isBetToday){
      const pickedCoin = await this.pickthemService.getPickedCoin(todayStage.pickThemStageId, userId);
      const pickedCoinInfo = await this.pickthemService.getPickedCoinInfo(todayStage.pickThemStageId, isBetToday.coinId);
      const pickedCoinPriceGap = await this.getTodayCoinPriceGap(req, [isBetToday.coinId]);

      return {
        success: true,
        result: {
          stage: todayStage,
          chosen: {
            ...pickedCoinInfo,
            price: pickedCoinPriceGap.result[0]
          },
          coin: [pickedCoin],
        }
      }
    }

    else{
      const todayCoins = await this.pickthemService.getTodayCoinsByStageId(todayStage.pickThemStageId);
      return {
        success: true,
        result: {
          stage: todayStage,
          chosen: null,
          coin: todayCoins,
        }
      }
    }
  }

  @Post('/prediction/:pickThemStageId')
  @UseGuards(JWTAuthGuard)
  async postTodayStage(@Req() req: OGRequest, @Body() createStageDto: CreateStageDto, @Param('pickThemStageId') pickThemStageId: number){
    const {userId} = req.user;

    const openedPickThem = await this.pickthemService.getOpenPickThem();
    if(!openedPickThem || (openedPickThem && !openedPickThem.isParticipable)){
      throw new OGException({
        errorCode: -409,
        errorMessage: 'Event is not available.',
      }, 400);
    }

    const joinedUser = await this.pickthemService.getUserByUserId(openedPickThem.pickThemId, userId);
    if(!joinedUser){
      throw new OGException({
        errorCode: -407,
        errorMessage: 'Not Joined User.',
      }, 400);
    }

    const todayStage = await this.pickthemService.getTodayStage();

    if(!todayStage ||
      (todayStage.pickThemStageId !== pickThemStageId) ||
      todayStage.state !== 'ongoing' ||
      !todayStage.isParticipable
      ){
      throw new OGException({
        errorCode: -402,
        errorMessage: 'Invalid Access.',
      }, 400);
    }

    const isBetToday = await this.pickthemService.getMyTodayBetting(userId);
    if(isBetToday){
      throw new OGException({
        errorCode: -403,
        errorMessage: 'Already Bet.',
      }, 400);
    }

    const todayCoins = await this.pickthemService.getTodayCoinsByStageId(todayStage.pickThemStageId);
    if(!todayCoins.map(coin => coin.coinId).includes(createStageDto.coinId)){
      throw new OGException({
        errorCode: -404,
        errorMessage: 'Invalid coinId.',
      }, 400);
    }

    const createBet = await this.pickthemService.createBet(openedPickThem.pickThemId, pickThemStageId, createStageDto, userId);
    if(!createBet){
      throw new OGException({
        errorCode: -401,
        errorMessage: 'Internal Server Error.',
      }, 500);
    }

    return {
      success: true,
      result: pickThemStageId
    }
  }

  @Get('/stages')
  @UseGuards(JWTAuthGuard)
  async getMyPrediction(@Req() req: OGRequest){
    const {userId} = req.user;

    const openedPickThem = await this.pickthemService.getOpenPickThem();
    if(!openedPickThem){
      throw new OGException({
        errorCode: -405,
        errorMessage: 'Not Allow.',
      }, 400);
    }

    const joinedUser = await this.pickthemService.getUserByUserId(openedPickThem.pickThemId, userId);
    if(!joinedUser){
      throw new OGException({
        errorCode: -407,
        errorMessage: 'Not Joined User.',
      }, 400);
    }

    const myPrediction = await this.pickthemService.getMyPrediction(openedPickThem.pickThemId, userId);

    let crystals = Math.pow(2, joinedUser.count);
    if(myPrediction.elixir.length > 0){
      crystals = crystals * Math.pow(2, myPrediction.elixir.length);
    }

    return {
      success: true,
      result: {
        crystals,
        streak: myPrediction.streak,
        prediction: myPrediction.prediction,
      }
    }
  }

  @Get('/elixir')
  @UseGuards(JWTAuthGuard)
  async getMyElixir(@Req() req: OGRequest){
    const {userId} = req.user;

    const openedPickThem = await this.pickthemService.getOpenPickThem();
    if(!openedPickThem){
      throw new OGException({
        errorCode: -405,
        errorMessage: 'Not Allow.',
      }, 400);
    }

    const joinedUser = await this.pickthemService.getUserByUserId(openedPickThem.pickThemId, userId);
    if(!joinedUser){
      throw new OGException({
        errorCode: -407,
        errorMessage: 'Not Joined User.',
      }, 400);
    }

    const myElixir = await this.pickthemService.getMyElixirDetail(openedPickThem.pickThemId, userId);

    Object.values(myElixir).forEach((elixir: Elixir) => {
      if(elixir.has && elixir.count < elixir.goal){
        throw new OGException({
          errorCode: -411,
          errorMessage: 'You Have no permission.',
        }, 400);
      }
    })

    return {
      success: true,
      result: myElixir,
    }
  }

}
