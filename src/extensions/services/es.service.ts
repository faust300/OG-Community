import { Injectable, OnModuleInit } from "@nestjs/common";
import axios from "axios";

@Injectable()
export default class ESService implements OnModuleInit{
  private userEndpoint = 'https://vpc-og-community-vza7okejvxlssdzzhrxza2m2hi.ap-southeast-1.es.amazonaws.com/post_en,post_ko/_update_by_query';

  onModuleInit() {

  }

  userSearchBody(type: string, userId: number, cur: string){
    const body = {
      "script": {
        "source": `ctx._source.${type} = "${cur}"`,
        "lang": "painless"
      },
      "query": {
        "match": {
            "user.id": userId
        }
      }
    }
    return body;
  }

  async updateUserProfileImage(userId: number, updatedData: string): Promise<void>{
    try {
      await axios.post(this.userEndpoint, this.userSearchBody('user.profileImage', userId, updatedData));
    } catch (error) {
      console.log(error);
    }
  }

  async updateUserName(userId: number, updatedData: string): Promise<void>{
    try {
      await axios.post(this.userEndpoint, this.userSearchBody('user.name', userId, updatedData));
    } catch (error) {
      console.log(error);
    }
  }

  async updateUserTitle(userId: number, updatedData: string): Promise<void>{
    try {
      await axios.post(this.userEndpoint, this.userSearchBody('user.title', userId, updatedData));
    } catch (error) {
      console.log(error);
    }
  }

}