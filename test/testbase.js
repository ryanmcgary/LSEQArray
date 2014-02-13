var expect = require('expect.js');
var Mocha  = require('mocha');
var bigInt = require('big-integer');

var Base = require('../lib/base.js');
var ID = require('../lib/identifier.js');

describe('base.js', function() {
    
    describe('base', function(){
	it('trivial test of setup', function(){
	    var base = new Base(1337);
	    expect(base._b).to.be.eql(1337);
	});
    });
    
    describe('getBitBase', function(){
	it('trivially return the bit size of certain level', function(){
	    var base = new Base(42);
	    expect(base.getBitBase(5)).to.be.eql(47);
	});
    });

    describe('getSumBit', function(){
	it('should return number of bits from lvl-0 to lvl-X', function(){
	    var base = new Base(5);
	    expect(base.getSumBit(0)).to.be.eql(base._b); // 5
	    expect(base.getSumBit(1)).to.be.eql(base._b*2+1) // 11
	    expect(base.getSumBit(2)).to.be.eql(base._b*3+3) // 18
	});
    });

    describe('getInterval', function(){
	it('should return an empty interval at lvl 0', function(){
	    var base = new Base(3);
	    var id1 = new ID(bigInt(17),[0,0],[0,0]); // [1,1]
	    var id2 = new ID(bigInt(31),[0,0],[0,0]); // [1,15]
	    expect(base.getInterval(id1,id2,0)).to.be.below(0);
	});
	
	it('should return an interval at level 1 of 13', function(){
	    var base = new Base(3);
	    var id1 = new ID(bigInt(17),[0,0],[0,0]); // [1,1]
	    var id2 = new ID(bigInt(31),[0,0],[0,0]); // [1,15]
	    expect(base.getInterval(id1,id2,1)
		   .compare(bigInt(13))).to.be.eql(0);
	});

	it('should return an interval at level 1 of 14', function(){
	    var base = new Base(3);
	    var id1 = new ID(bigInt(1),[0],[0]); // [1]
	    var id2 = new ID(bigInt(31),[0,0],[0,0]); // [1,15]
	    expect(base.getInterval(id1,id2,1)
		   .compare(bigInt(14))).to.be.eql(0);
	});

	it('should return an interval at level 1 of 11', function(){
	    var base = new Base(3);
	    var id1 = new ID(bigInt(20),[0,0],[0,0]);
	    // [1,4] precedes the [1,3]
	    var id2 = new ID(bigInt(19),[0,0],[0,0]); // [1,3] 
	    expect(base.getInterval(id1,id2,1)
		   .compare(bigInt(11))).to.be.eql(0);
	});

    });
});
