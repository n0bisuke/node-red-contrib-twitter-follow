module.exports = (RED) => {
    'use strict';

    const twitter = require('twitter');
    
    const main = function(config){
        const node = this;
        RED.nodes.createNode(node, config);

        let restFollowCount = 1; //1時間あたりのフォロー回数 残り
        config.limit = (config.limit == '') ? 1 : config.limit; //1時間あたりのフォローリミット回数
        setInterval(() => restFollowCount = config.limit,1000 * 60 * 60);

        let twitterconfig;
        try {
            twitterconfig = require('../../env');
        } catch (error) {
            twitterconfig = { 
                consumer_key: config.ConsumerKey,
                consumer_secret: config.ConsumerSecret,
                access_token_key: config.AccessTokenKey,
                access_token_secret: config.AccessTokenSecret
            };
        }
        
        let client = {};
        try {
            client = new twitter(twitterconfig);
        } catch (error) {
            console.log(error);
        }

        node.on('input', async (msg) => {
            // const mes = msg.payload;
            try {
                if(!msg.tweet) throw new Error('Tweetオブジェクトがありません。');
                if(restFollowCount <= 0) throw new Error('分間のリミットです');

                console.log(`[${msg.tweet.user.id_str}]${msg.tweet.user.name}さんをフォローしようとしています。`);
                await client.post('friendships/create', {user_id: msg.tweet.user.id});
                console.log(`${msg.tweet.user.name}さんをフォローしました。`);
                restFollowCount--; //フォロー回数をカウントダウン
                msg.payload = `${msg.tweet.user.name}さんをフォローしました。`;
            } catch (error) {
                console.log(error);
                msg.payload = error;
            }

            node.send(msg);
        });

    }

    RED.nodes.registerType("Follow", main);
}