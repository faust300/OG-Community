import { ConnectionService } from 'src/extensions/services/connection.service';
import { ReturnFollowers } from 'src/follow/dto/return-follower';
import { ReturnPost } from 'src/post/dto/return-post.dto';
import { ActivePromotion } from 'src/promotions/dto/promotion.dto';
import { ReturnRecommendTopic } from 'src/topic/dto/recommend-topic.dto';

export const convertPromotionToPost = (
  promotion: ActivePromotion,
): ReturnPost => {
  return {
    dataType: 'promotion',
    title: promotion.title,
    postId: 0,
    userId: 0,
    userName: promotion.userName,
    userProfilePath: promotion.userProfile,
    userTitle: 0,
    userTitleName: 'promoted',
    authorId: 0,
    authorName: '',
    authorProfilePath: '',
    authorLink: '',
    authorType: '',
    authorReservation1: '',
    authorReservation2: '',
    originLink: promotion.externalUrl,
    contents: {
      blocks: [
        {
          data: {
            text: 'promotion',
            type: 'paragraph',
          },
        },
      ],
    } as any,
    thumbnail: promotion.contentsImageUrl,
    videoThumbnail: promotion.contentsVideoUrl,
    viewCount: promotion.viewCount,
    voteCount: promotion.voteCount,
    commentCount: 0,
    hasReferral: false,
    isEdit: false,
    isNSFW: false,
    isVerified: true,
    createdAt: promotion.promotionUnitCreatedAt,
    updatedAt: promotion.promotionUnitUpdatedAt,
    vote: promotion.voteType,
    isMine: promotion.voteType != null,
    lang: 'EN',
    imageCount: 0,
  };
};


const randomNum = (min: number, max: number) => {
  var randNum = Math.floor(Math.random()*(max-min+1)) + min;
  return randNum;
}

export const addPromotionPost = async (
  post: ReturnPost[],
  promotions: ActivePromotion[],
  injectIndex: number = 10,
): Promise<ReturnPost[]> => {

  
  let posts: ReturnPost[] = [];
  if (promotions && promotions.length > 0) {
    const promotion = promotions[0];

    const promotionPost = convertPromotionToPost(promotion);

    if(post.length > 0){
      post.map((post: ReturnPost, idx: number) => {
        // if (idx != 0 && idx % 4 === 0 && promotions.length >= Math.floor(idx / 4)) {
        if (idx == injectIndex) {
          // const promotion = promotions[Math.floor(idx / 4) - 1];
          posts.push(promotionPost);
        }
  
        posts.push(post);
      });
  
      if (post.length < injectIndex + 1) {
        posts.push(promotionPost);
      }
    } else {
      posts.push(promotionPost);
    }
  } else {
    posts = post;
  }

  return posts;
};

export const addRecommendFollowers = async (
  post: ReturnPost[],
  followers: ReturnFollowers[],
  injectIndex: number = 4,
): Promise<any[]> => {
  let posts: any[] = [];
  let followersArray = {
    dataType: 'followers',
    title: 'Recommended frens',
    moreUrl: '',
    followers: [],
  };
  
  if (followers && followers.length > 0) {
    if(post.length > 0){
      post.map((post: ReturnPost, idx: number) => {
        if (idx == injectIndex) {
          followersArray.followers = followers;
          posts.push(followersArray);
        }
        posts.push(post);
      });
  
      if (post.length < injectIndex + 1) {
        followersArray.followers = followers;
        posts.push(followersArray);
      }
    } else {
      followersArray.followers = followers;
      posts.push(followersArray);
    }
  } else {
    posts = post;
  }

  return posts;
};

export const addRecommendTopic = async (
  posts: ReturnPost[],
  topic: ReturnRecommendTopic,
  injectIndex: number = 20,
) => {
  let returnPosts: any[] = [];
  if (topic) {
    if(posts.length > 0){
      posts.map((post: ReturnPost, idx: number) => {
        if (idx == injectIndex) {
          returnPosts.push(topic);
        }
        returnPosts.push(post);
      });
    }
    if (posts.length < injectIndex + 1) {
      returnPosts.push(topic);
    }
  } else {
    returnPosts = posts;
  }
  return returnPosts;
};

export const postListTemplate = async (
  posts: ReturnPost[],
  tags: string[],
  promotions: ActivePromotion[],
  followers: ReturnFollowers[],
  topic: ReturnRecommendTopic,
  template: string,
  next?: string | null,
  postCursor?: string | null,
): Promise<ReturnPost[]> => {
  
  const templateArray = [];
  const splitTemplate = template.split('|');
  splitTemplate.map((item: string) => {
    const replateItem = item.replace('[', '').replace(']', '').replace(' ', '').split(',');
    templateArray.push(replateItem)
  })
  const templateRandomIndex = randomNum(1, 4);
  const promotionInjectIndex = randomNum(5, 10);
  if(!next && !postCursor){
    posts = posts;
  } else {
    
    if(!next){
      if(tags.length == 0){
        posts = await addRecommendTopic(posts, topic, Number(templateArray[0][0]));
      }
      posts = await addRecommendFollowers(posts, followers, Number(templateArray[0][1]));
      posts = await addPromotionPost(posts, promotions, Number(templateArray[0][2]));
      
    } else {
      if(postCursor){
        if(tags.length == 0){
          posts = await addRecommendTopic(posts, topic, Number(templateArray[templateRandomIndex][0]));
        }
        posts = await addRecommendFollowers(posts, followers, Number(templateArray[templateRandomIndex][1]));
        posts = await addPromotionPost(posts, promotions, Number(templateArray[templateRandomIndex][2]));
      } 
    }

  }

  return posts
}