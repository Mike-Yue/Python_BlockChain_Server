"use strict";
const express = require('express')
const basicAuth = require("express-basic-auth")
const app = express()
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()
const PythonShell = require('python-shell')
const sleep = require('system-sleep')
const crypto = require('crypto')

let insert_account_data = "INSERT INTO Accounts(Username, Password) VALUES (?, ?)"
let insert_time_data = "INSERT INTO Mining_Times(Times) VALUES (?)"
let query_time_data = "SELECT * from Mining_Times"
let query_row_data = "SELECT * from BlockChain ORDER BY Block_Number"
let query_table_size = "SELECT count(*) as size FROM BlockChain"
let insert_row_data = "INSERT INTO BlockChain(Block_Number, Nonce, Data, Previous_Hash, Current_Hash) VALUES (?, ?, ?, ?, ?)"

global.BlockChain = []

class Block{
	constructor(block_num, block_nonce, block_data, block_previous_hash, block_current_hash){
		this.number = block_num;
		this.nonce = block_nonce;
		this.data = block_data;
		this.prev_hash = block_previous_hash;
		this.curr_hash = block_current_hash;
	}
}

app.use(basicAuth({
	users: { 'admin': 'supersecret'}
})) 

let db = new sqlite3.Database('C:/Users/Mike/PycharmProjects/firstProject/venv/blockchain_storage.db', (err) =>{
	if(err){
		console.error(err.message);
	}
	console.log('Connected to database');
});

db.all(query_row_data, [], (err, rows)=>{
	if(err){
		throw err;
	}
	rows.forEach((row)=>{
		var block = new Block(row.Block_Number, row.Nonce, row.Data, row.Previous_Hash, row.Current_Hash)
		BlockChain.push(block)
	})
})


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', function (req, res) {
	console.log('Get Request for mining a block received!')
	var data = BlockChain[BlockChain.length - 1]
    res.status(200).json(data)
})

app.get('/interrupt', function(req, res){
	var size
	console.log('Making sure Block has not already been mined')
	db.all(query_table_size, [], (err, rows)=>{
	if(err){
		throw err;
	}
	rows.forEach((row)=>{
		size = (row.size)
	})
	res.status(200).json(size)
})
})

app.get('/allblocks', function(req, res){
	console.log('Get Request for all blocks received!')
	var data = BlockChain //Returns all blocks
	res.status(200).json(data)
	var test = "test"
	console.log(crypto.createHash('sha256').update(test).digest('hex'))
})

app.get('/times', function(req, res){
	console.log('Get Request for times data received!')
	var times = []
	//Queries table for size and then prints out all the row data
	db.all(query_time_data, [], (err, rows)=>{
		if(err){
			throw err;
		}
		rows.forEach((row)=>{
			var time = row.Times
			times.push(time)
		})
		res.status(200).json(times)
	})

})

app.post("/postaccount", (req, res)=>{
	console.log('Post Account Request received')
	var username = req.body.username
	var password = crypto.createHash('sha256').update(req.body.password).digest('hex')
	db.run(insert_account_data, [username, password], function(err){
		if(err){
			return console.log(err.message)
		}
	})
	console.log("Account Creation successful!")
	res.send("lit")
})

app.post("/postdata", (req, res) => {
	console.log('Post Data Request received')
	var posted_data = [req.body.number, req.body.nonce, req.body.data, req.body.prev_hash, req.body.curr_hash, req.body.time]
	var block = new Block(req.body.number, req.body.nonce, req.body.data, req.body.prev_hash, req.body.curr_hash)
	BlockChain.push(block)
	console.log(posted_data)
	db.run(insert_row_data, [req.body.number, req.body.nonce, req.body.data, req.body.prev_hash, req.body.curr_hash], function(err){
		if(err){
			return console.log(err.message)
		}
		res.send("Haha!")
	})

	db.run(insert_time_data, [req.body.time], function(err){
		if(err){
			return console.log(err.message)
		}
	})

});


app.listen(8080, () => console.log('Server is up and running!'))
