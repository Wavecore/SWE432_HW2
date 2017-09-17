var express = require('express');
var fetch = require('node-fetch');
var bodyParser = require('body-parser');
var app = express();
var records;
var cipID;
var recordBook
app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.json());

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));

});

app.get('/', function (req, res) {
    res.send('Hello World!');
});

class CIPRecords{
    constructor(data){
        this.grads_total = data.get("grads_total");
        this.grads_men = data.get("grads_men");
        this.grads_women = data.get("grads_women");
        this.grads_native = data.get("grads_native");
        this.grads_native_men = data.get("grads_native_men");
        this.grads_native_women = data.get("grads_native_women");
        this.grads_asian = data.get("grads_asian");
        this.grads_asian_men = data.get("grads_asian_men");
        this.grads_asian_women = data.get("grads_asian_women");
        this.grads_black = data.get("grads_black");
        this.grads_black_men = data.get("grads_black_men");
        this.grads_black_women = data.get("grads_black_women");
        this.grads_hispanic = data.get("grads_hispanic");
        this.grads_hispanic_men = data.get("grads_hispanic_men");
        this.grads_hispanic_women = data.get("grads_hispanic_women");
        this.grads_hawaiian = data.get("grads_hawaiian");
        this.grads_hawaiian_men = data.get("grads_hawaiian_men");
        this.grads_hawaiian_women = data.get("grads_hawaiian_women");
        this.grads_white = data.get("grads_white");
        this.grads_white_men = data.get("grads_white_men");
        this.grads_white_women = data.get("grads_white_women");
        this.grads_multi = data.get("grads_multi");
        this.grads_multi_men = data.get("grads_multi_men");
        this.grads_multi_women = data.get("grads_multi_women");
        this.grads_unknown = data.get("grads_unknown");
        this.grads_unknown_men = data.get("grads_unknown_men");
        this.grads_unknown_women = data.get("grads_unknown_women");
        this.grads_nonresident = data.get("grads_nonresident");
        this.grads_nonresident_men = data.get("grads_nonresident_men");
        this.grads_nonresident_women = data.get("grads_nonresident_women");
        this.year = data.get("year");
        this.grads_rank = data.get("grads_rank");
        this.cip = data.get("cip");
        this.name = data.get("name");
    }

}

class CIPRecordBook{
    constructor(headers){
        this.book = new Map();
        this.recordHeaders = headers;
        this.newkey = 0;
    }
    add(ciprecord){
        this.book.set(this.newkey,ciprecord);
        this.newkey += 1;
    }
    update(index,ciprecord){
        if(this.book.has(index))
            this.book.set(index,ciprecord);
    }
    remove(index){
        if(this.book.has(index))
            this.book.delete(index)
    }
    getCIPRecord(index){
        return this.book.get(index)
    }
}
fetch('https://api.datausa.io/api/?show=cip&sumlevel=all')
    .then(function(res){
        return res.json();
    }).then(function(json){
    records = json;
    fetch('https://api.datausa.io/attrs/cip/')
        .then(function(res){
            return res.json();
        }).then(function(json){
        cipID = json;
        let nameIndex = cipID.headers.indexOf('name');
        let idIndex = cipID.headers.indexOf('id');
        //console.log(`nameIndex = ${nameIndex} idIndex = ${idIndex}`);
        let idToName = new Map();
		for(var i of cipID.data){
			//console.log(i[1]);
			//console.log(`Name: ${i[nameIndex]}  ID: ${i[idIndex]}`);
			idToName.set(i[idIndex],i[nameIndex]);
		}
        let cipHeader = records['headers'];
        cipHeader.push('name');
		var recBook = new CIPRecordBook(cipHeader);
		for(var i of records['data']){
			let cipRecordInfo = new Map();
			for(var j in i){
				cipRecordInfo.set(cipHeader[j],i[j]);
				if(cipHeader[j] === 'cip'){
					//console.log(i[j]);
					cipRecordInfo.set('name',idToName.get(i[j]));
				}
			}
			//console.log(cipRecordInfo);
			recBook.add(new CIPRecords(cipRecordInfo));
			//console.log(recordBook);
		}
		//console.log(recordBook);
        console.log('Done');
        return recBook;
    }).then(function(recBook){
    	recordBook = recBook;
	});

});
//===========Debugging Endpoints============================
app.get('/test/:inputStuff', function (req, res) {
  res.send(req.params.inputStuff);
});

app.get('/records',function(req,res){
	res.send(records);
});
app.get('/cipID',function(req,res){
    res.send(cipID);
});
app.get('/recordbook',function(req,res){
	console.log(recordBook);
	res.send(recordBook);
});
//=======Scenario 5=======================================
app.get('/record/:recordID',function(req,res){
    res.send(recordBook.getCIPRecord(parseInt(req.params.recordID)));
});
app.post('/record/',function(req,res){
    let input = new Map();
    for (var i in req.body){
        input.set(i,req.body[i]);
    }
    try{
        if(input.size == recordBook.recordHeaders.length && recordBook.recordHeaders.every(function(element, index) {
                return input.has(element); })){
            recordBook.add(new CIPRecords(input));
            res.sendStatus(200);
        }
        else
            res.sendStatus(400);
    }
    catch(err){
        console.log(err);
        res.sendStatus(400);
    }
});
app.delete('/record/:recordID',function(req,res){
    if(recordBook.book.has(parseInt(req.params.recordID))){
        recordBook.remove(parseInt(req.params.recordID));
        res.sendStatus(200);
    }
    else
        res.sendStatus(410);
});
app.put('/record/:recordID',function(req,res){
    let input = new Map();
    let index = parseInt(req.params.recordID);
    for (var i in req.body){
        input.set(i,req.body[i]);
    }
    try{
        if(input.size == recordBook.recordHeaders.length && recordBook.recordHeaders.every(function(element, index) {
                return input.has(element); }) && recordBook.book.has(index)){
            recordBook.update(index,new CIPRecords(input));
            res.sendStatus(200);
        }
        else if(recordBook.book.has(index) == false)
            res.sendStatus(410);
        else
            res.sendStatus(400);
    }
    catch(err){
        console.log(err);
        res.sendStatus(400);
    }
});
//=======Scenario 4=======================================
app.get('/ratio/:ethn?/:year?/:cip?',function(req,res){
    let ethn = req.params.ethn;
    let ethnMale = ethn+'_men';
    let ethnFema = ethn+'_women';
    let maleCount = 0;
    let femaCount = 0;
    let year = parseInt(req.params.year);
    if(isNaN(year) && typeof req.params.year != 'undefined' && req.params.year != 'all'){
        res.sendStatus(400);
        return;
    }
    let cip = req.params.cip;
    if(ethn == undefined || ethn == 'all' || ethn == 'total' || ethn == 'grads'){
        ethnMale = 'grads_men';
        ethnFema = 'grads_women';
    }
    else if(recordBook.recordHeaders.indexOf(ethnMale) == -1 || recordBook.recordHeaders.indexOf(ethnFema) == -1){
        res.sendStatus(400);
        return;
    }
    //res.send(ethnMale + '    '+ethnFema);
   for(var i of recordBook.book) {
       if ((i[1].year == year || typeof req.params.year == 'undefined' || req.params.year == 'all') &&
           (i[1].name == cip || typeof cip == 'undefined')){
           maleCount += i[1][ethnMale];
           femaCount += i[1][ethnFema];
       }
   }
   //console.log('maleCount: '+maleCount + '     femaCount: '+femaCount);
   res.send(""+maleCount/femaCount);
});
//===============================================

// ************ Scenario 1 *******************
//Get the grand rank of given record.
app.get('/gradrank/:recordID',function(req,res){
    let rec = recordBook.getCIPRecord(parseInt(req.params.recordID));

    // check for error in request
    if(typeof req.params.recordID == 'undefined'){
        res.sendStatus(400);
        return;
    }
    //console.log(recordBook);
    res.send('Grad rank is ' + rec.grads_rank + ' for record: ' + req.params.recordID);
});
//******************************************************
// ************ Scenario 2 *******************
//Get the data for how many grads in given year
app.get('/totalgrad/:year',function(req,res){
    let year =req.params.year;
    let grandCnt = 0;

    // check for error in request
    if(typeof req.params.year == 'undefined'){
        res.sendStatus(400);
        return;
    }

    // get the total grad count in given year
    for(var i of recordBook.book) {
        // only pick the music teachers
        if ((i[1].year == year)){
            grandCnt += i[1]['grads_total'];
        }
    }

    //console.log('grandCnt: '+grandCnt);
    res.send(""+grandCnt);

});
//************************************************
// ************ Scenario 3 *******************
//Get the data for how many males or females work as a music teacher(name: 'Music Teacher Education')
app.get('/musicteachers/:gender',function(req,res){
    let gndr =req.params.gender.toString().toUpperCase();
    let teachCntbyGendr = 0;
    let musicTeach = 'Music Teacher Education';

    // check for error in request
    if(typeof req.params.gender == 'undefined'){
        res.sendStatus(400);
        return;
    }

    //console.log("GENDER:" + gndr);
    // set gender
    if(gndr === 'MALE'){
        gndr='grads_men';
    }else if(gndr ==='FEMALE'){
        gndr='grads_women';
    }

    // get the total gender count
    for(var i of recordBook.book) {
        // only pick the music teachers
        if ((i[1].name == musicTeach)){
            console.log('music:' + i[1][gndr]);
            teachCntbyGendr += i[1][gndr];
        }
    }

    if(teachCntbyGendr==0){
        res.sendStatus(404);
        return;
    }
    //console.log('teachCntbyGendr: '+teachCntbyGendr);
    res.send(""+teachCntbyGendr);

});
//******************************************************