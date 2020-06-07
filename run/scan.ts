// dotenv fetch
import * as dotenv from 'dotenv';
dotenv.config({
  path: '../.env',
});

import { tx, Query } from '../modules/neo4j';

// AWS 설정
import * as AWS from 'aws-sdk';
AWS.config.update({ region: 'ap-northeast-2' });

// DDB Client
const docClient = new AWS.DynamoDB.DocumentClient();

(async function () {
  try {
    let scanParams = {
      TableName: 'InstaTourRawData',
      Limit: 10000,
    };

    let items: any;
    let counts = 0;
    let num = 0;
    let querys = [];
    let params = [];

    do {
      items = await docClient.scan(scanParams).promise();
      counts += items.Count;
      console.log('items', counts, 309956);

      for (const item of items.Items) {
        querys = [];
        params = [];

        // 키 분리
        const key = item.key;

        // 해시태그 분리와 유저이름 삭제
        const hashtags = item.hashtags;
        delete item.hashtags;
        delete item.username;

        // 이미지 S3로 연결
        item.img_url = `${process.env.S3_URL}/${process.env.STAGE}/${key}.jpg`;

        // 추가
        querys.push(Query.create_post_instagram);
        params.push(item);

        for (const hashtag of hashtags) {
          querys.push(Query.post_hashtag_relation);
          params.push({
            pid: key,
            tid: hashtag.toLowerCase(),
          });
        }
        await tx(querys, params, num++);
      }
      // console.log('querys', querys);
      // console.log('params', params);
      scanParams['ExclusiveStartKey'] = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != 'undefined');
  } catch (error) {
    console.error(error);
  }
})();

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
