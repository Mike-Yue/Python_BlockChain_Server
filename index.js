"use strict";
const express = require('express')
const basicAuth = require("express-basic-auth")
const app = express()
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()
const PythonShell = require('python-shell')
const sleep = require('system-sleep')

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
	console.log('Connected to blockchain storage database');
});

db.all(query_row_data, [], (err, rows)=>{
	if(err){
		throw err;
	}
	rows.forEach((row)=>{
		var block = new Block(row.Block_Number, row.Nonce, row.Data, row.Previous_Hash, row.Current_Hash)
		BlockChain.push(block)
	})
	console.log(BlockChain.length)
})


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', function (req, res) {
	console.log('Get Request received!')
	var data = BlockChain[BlockChain.length - 1]
    res.status(200).json(data)
})

app.get('/allblocks', function(req, res){
	var data = BlockChain //Returns all blocks
	res.status(200).json(data)
})

app.get('/times', function(req, res){
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
		console.log(times.length)
		res.status(200).json(times)
	})

})

app.post("/postdata", (req, res) => {
	var posted_data = [req.body.number, req.body.nonce, req.body.data, req.body.prev_hash, req.body.curr_hash, req.body.time]
	var block = new Block(req.body.number, req.body.nonce, req.body.data, req.body.prev_hash, req.body.curr_hash)
	BlockChain.push(block)
	console.log(posted_data)
	db.run(insert_row_data, [req.body.number, req.body.nonce, req.body.data, req.body.prev_hash, req.body.curr_hash], function(err){
		if(err){
			return console.log(err.message)
		}
		res.send("Haha!")
		console.log("It worked!")
	})

	db.run(insert_time_data, [req.body.time], function(err){
		if(err){
			return console.log(err.message)
		}
		console.log("Time logged!")
	})

});

app.post("/posttime", (req, res) => {
	console.log(req.body.total_time)
	/*db.run(insert_time_data, [req.body.total_time], function(err){
		if(err){
			return console.log(err.message)
		}
		console.log("Time posted!")
	})*/
})

app.listen(8080, () => console.log('Example app listening on port 8080!'))
