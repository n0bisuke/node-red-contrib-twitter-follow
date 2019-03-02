module.exports = (RED) => {
    'use strict';

    const twitter = require('twitter');

    const main = function(config){
        const node = this;
        RED.nodes.createNode(node, config);
        let twitterconfig;
        try {
            twitterconfig = require('../../env');
        } catch (error) {
            twitterconfig = { 
                consumer_key: config.consumer_key,
                consumer_secret: config.consumer_secret,
                access_token_key: config.access_token_key,
                access_token_secret: config.access_token_secret
            };
        }
        
        let client = {};
        try {
            client = new twitter(twitterconfig);
        } catch (error) {
            console.log(error);
        }

        node.on('input', async (msg) => {
            let newestFollowerId = '';
            const mes = msg.payload;

            const watchFollow = () => {
                client.get(`followers/ids`, (error, tweets, response) => {
                    if (!error) {
                        //2回目以降かつnewestFollowerIdが差し代わった場合
                        if(newestFollowerId !== '' && newestFollowerId !== JSON.parse(response.body).ids[0]){
                            console.log(`new follower 「${newestFollowerId}」`);
                            client.post(`friendships/create`, {user_id: newestFollowerId});
                            console.log(`「${newestFollowerId}」 follow done`);
                            client.get(`users/show`, {user_id: newestFollowerId}, (error, tweets, response) => {
                                if (!error) {
                                  console.log(tweets);
                                  msg.tweet.user = tweets;
                                }
                            });
                        }
                        newestFollowerId = JSON.parse(response.body).ids[0];
                        console.log(`newestFollowerId id ${newestFollowerId}`);
                        console.log(`waiting...`);
                        msg.payload = `waiting...`;
                        node.send(msg);
                        setTimeout(watchFollow, 1000 * 60);
                    }else{
                        console.log(error);
                        console.log(`waiting retry...`);
                        setTimeout(watchFollow, 1000 * 60 * 10); //10分後にリトライ
                    }
                });
            }
        });

    }

    RED.nodes.registerType("FollowEvent", main);
}