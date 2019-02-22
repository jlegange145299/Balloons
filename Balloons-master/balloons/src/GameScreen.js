import React, { Component } from 'react';
import Phaser from 'phaser';
import './App.css';

var game;

class GameScreen extends Component {
  constructor(props) {
  super(props);
  this.state = {
    game: null,

  }

  //this.create = this.create.bind(this);
}

preload(){
  this.load.image('background', './phaser/Background.png');
  //this.load.image('balloon', './phaser/Balloon Pop.png');
  this.load.spritesheet('balloon',
    './phaser/Balloon Pop.png',
    { frameWidth: 390, frameHeight: 481 }
);
  this.load.image('cloudBack', './phaser/Clouds_03_Back.png');
  this.load.image('cloudMid', './phaser/Clouds_02_Middle.png');
  this.load.image('cloudFront', './phaser/Clouds_01_Front.png');
}

create() {
  //console.log(game);
  //game.stage.backgroundColor = "#4488AA";



  let bg = this.add.sprite(0, 0, 'background');
  bg.displayWidth = window.innerWidth;
  bg.displayHeight = window.innerHeight;
  bg.setOrigin(0,0);

  this.cloudBack = this.add.tileSprite(window.innerWidth /2, window.innerHeight/2, window.innerWidth, window.innerHeight, 'cloudBack');
  this.cloudBack.setScale(1);
  this.cloudBack.tileScaleX = 0.5;
  this.cloudBack.tileScaleY = 0.6;

  this.cloudMid = this.add.tileSprite(window.innerWidth /2, window.innerHeight/2, window.innerWidth, window.innerHeight, 'cloudMid');
  this.cloudMid.setScale(1);
  this.cloudMid.tileScaleX = 0.5;
  this.cloudMid.tileScaleY = 0.6;

  this.cloudFront = this.add.tileSprite(window.innerWidth /2, window.innerHeight/2, window.innerWidth, window.innerHeight, 'cloudFront');
  this.cloudFront.setScale(1);
  this.cloudFront.tileScaleX = 0.5;
  this.cloudFront.tileScaleY = 0.6;

  let balloon = this.physics.add.sprite(100, 100, 'balloon').setInteractive();
  balloon.displayWidth = 140;
  balloon.displayHeight = 200;
  console.log(balloon)
  //balloon.body.debugShowBody(true)
  balloon.body.maxVelocity = {x: 3000, y: 3000};
  balloon.setBounce(1);
  balloon.setCollideWorldBounds(true);
  balloon.body.setGravityY(50);

  this.anims.create({
    key: 'idle',
    frames: this.anims.generateFrameNumbers('balloon', { start: 0, end: 0 }),
    frameRate: 64
    //repeat: -1
  });

  this.anims.create({
    key: 'pop',
    frames: this.anims.generateFrameNumbers('balloon', { start: 0, end: 16 }),
    frameRate: 96
    //repeat: -1
  });

  var animComplete = (animation, frame) =>
  {
      if(animation.key == "pop"){
        /*
        this.tweens.add({
            targets: balloon,
            duration: 1000,
            alpha: 0
        });*/
        balloon.x = Math.random() * window.innerWidth;
        balloon.y = 100;
        balloon.anims.play("idle", true);
      }

  }

  var velocityFromRotation = this.physics.velocityFromRotation;
  var velocity = new Phaser.Math.Vector2();

  balloon.setVelocity(Math.floor(Math.random() * 400 - 400) , Math.floor(Math.random() * 400 - 400));
  balloon.body.angularVelocity = 300;
  balloon.body.angularDrag = 0;
  balloon.on('pointerdown', function () {
    if(game.started){
      game.clickBalloon();
      //balloon.anims.play("pop", true);
      //balloon.on('animationcomplete', animComplete, this);
    }
    balloon.anims.play("pop", true);
    balloon.on('animationcomplete', animComplete, this);

});

}


update(){
  this.cloudBack.tilePositionX -= 0.15;
  this.cloudMid.tilePositionX += 0.3;
  this.cloudFront.tilePositionX -= 0.75;
}


componentWillReceiveProps(nextProps){
  game.clickBalloon = nextProps.clickBalloon;
  game.started = nextProps.gameStarted;
}

componentDidMount() {
  let gameScene = new Phaser.Scene(game);
  var config = {
    type: Phaser.AUTO,
    parent: 'phaser-parent',
    pixelArt: false,
    backgroundColor: 'rgba(176, 55, 110,0.5)',
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
      preload: this.preload,
      create: this.create,
      update: this.update
    }
};



game = new Phaser.Game(config);
console.log(game)
game.clickBalloon = this.props.clickBalloon;
game.started = this.props.gameStarted;


}


  render() {
    return (
      <section id="phaser-parent">
      </section>
    );
  }
}

export default GameScreen;
