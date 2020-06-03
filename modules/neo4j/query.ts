export const enum Query {
  create_user = 'CREATE (:User {id: $uid, nickname: $nickname, email: $email, profile: $profile, created_at: DATETIME()})',
  create_post_instagram = 'CREATE (:Post:Instagram {id: $key, img_url: $img_url, content: $content, likes: $likes, date: $date})',
  update_post = `MATCH (p:Post {id: $pid}) 
                CALL apoc.create.setProperties(p, $keys, $values) YIELD node 
                RETURN node`,
  post_hashtag_relation = `MATCH (p:Post {id: $pid}) 
                          MERGE (t:HashTag {id: $tid}) 
                          MERGE (p)-[:TAGGED]->(t)`,
}
