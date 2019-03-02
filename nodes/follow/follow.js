module.exports = (RED) => {
    'use strict';

    const twitter = require('twitter');
    console.log(`----`)
    console.log(RED);
    console.log(`----`)

    const main = function(config){
        const node = this;
        RED.nodes.createNode(node, config);
        let twitterconfig;
        console.log(`----`)
        console.log(node.twitterConfig);
        console.log(`----`)
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
            const mes = msg.payload;
            try {
                if(!msg.tweet) throw new Error('Tweetオブジェクトがありません。');

                console.log(`[${msg.tweet.user.id_str}]${msg.tweet.user.name}さんをフォローしようとしています。`);
                await client.post('friendships/create', {user_id: msg.tweet.user.id});
                console.log(`${msg.tweet.user.name}さんをフォローしました。`);            
            } catch (error) {
                console.log(error);
            }
            msg.payload = res.data;
            node.send(msg);
        });

    }

    RED.nodes.registerType("Follow", main);
}