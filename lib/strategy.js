var conf = require('./conf.js');
var Base = new (require('./base.js'))(conf._base);;
var ID = require('./identifier.js');

/*!
 * \class Strategy
 * \brief Enumerate the available sub-allocation strategies. The signature of
 * these functions is f(Id, Id, N+, N+, N, N): Id.
 * \param boundary the value used as the default maximum spacing between ids
 */
function Strategy(boundary){
    var DEFAULT_BOUNDARY = 10;
    this._boundary = boundary || DEFAULT_BOUNDARY;
};

/*!
 * \brief Choose an id starting from previous bound and adding random number
 * \param p the previous identifier
 * \param q the next identifier
 * \param level the number of concatenation composing the new identifier
 * \param interval the interval between p and q
 * \param s the source that creates the new identifier
 * \param c the counter of that source
 */
Strategy.prototype.bPlus = function (p, q, level, interval, s, c){
    
    // #0 process the interval for random
    var step = Math.min(this._boundary, interval);
    
    // #1 Truncate or extends p or q
    var diffBitCount = Base.getSumBit(p._c.length-1) - Base.getSumBit(level);

    var oldD = Math.floor(p._d / Math.pow(2,diffBitCount));

    // #2 create a digit for an identifier by adding a random value
    var randomInt = Math.floor(Math.random()*step +1);
    
    // #2a Digit
    var newD = oldD + randomInt;

    // #2b Source & counter
    var id = getSC(newD, p, q, level, s, c);
    return id;
};


Strategy.prototype.bMinus = function (p, q, level, interval, s, c){
    // #0 process the interval for random
    var step = Math.min(this._boundary, interval);
    
    var prevBitLength = Base.getSumBit(p._c.length - 1);
    var nextBitLength = Base.getSumBit(q._c.length - 1);
    var bitBaseSum = Base.getSumBit(level)

    // #1 Truncate or extends p and q
    var prev = Math.floor(p._d * Math.pow(2, bitBaseSum - prevBitLength));
    var next = Math.floor(q._d * Math.pow(2, bitBaseSum - nextBitLength));

    // #2 Handling particular case of next < prev
    if (next < prev){
	// #2a Look for the common root
	var i = 0;
        var sumBitI = Base.getSumBit(i);
        while ((Math.floor(prev / Math.pow(2, prevBitLength - sumBitI))  ==
                Math.floor(next / Math.pow(2, nextBitLength - sumBitI))) &&
               (bitBaseSum - sumBitI >= 0)) {
            ++i;
            sumBitI = Base.getSumBit(i);
        };
        // #2b: add one
        next = Math.floor(next / Math.pow(2, nextBitLength -
                                          Base.getSumBit(i - 1))) + 1;
        nextBitLength = Base.getSumBit(i-1);
        // #2c: append missing zeros
        next = Math.floor(next * Math.pow(2, bitBaseSum - nextBitLength));
    };
    
    var oldD = next;

    // #3 create a digit for an identifier by subing a random value
    var randomInt = Math.floor(Math.random()*step +1);
    
    // #3a Digit
    var newD = oldD - randomInt;

    // #3b Source & counter
    var id = getSC(newD, p, q, level, s, c);
    return id;
};

function getSC(d, p, q, level, s, c){
    var sources = [];
    var counters = [];

    var bitLength = Base.getSumBit(level);
    var tempD = d;

    for (var i = 0; i <= level; ++i) {
	// #1 truncate the digit of the new id to get the i^th value
	var sumBit = Base.getSumBit(i);
	var mask = Math.pow(2, Base.getBitBase(i));
	var valD = Math.floor(tempD / Math.pow(2, bitLength - sumBit)) % mask;
	// (bitLength-sumBit >=0)
	
	// #2 truncate previous value the same way
	var valP = Math.floor(p._d / Math.pow(2, Base.getSumBit(p._c.length-1)
					      - sumBit)) % mask;
	if ( i < p._c.length && valD == valP) { // #2a copy p source & counter
	    sources[i] = p._s[i];
	    counters[i] = p._c[i];
	} else {
	    var valQ =
		Math.floor(q._d / Math.pow(2, Base.getSumBit(q._c.length-1) -
					   sumBit)) % (mask);
	    if (i < q._c.length && valD == valQ) { // #2b copy q site & counter
		sources[i] = q._s[i];
		counters[i] = q._c[i];
	    } else { // 2c copy our source & counter
		sources[i] = s;
		counters[i] = c;
	    };
	};
    };
    return new ID(d, sources, counters);
};

module.exports = Strategy;