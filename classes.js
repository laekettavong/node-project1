module.exports.CreditCard = class CreditCard {
    constructor(firstName, lastName, brand, number, securityCode, expiresYear, expiresMonth){
        this.firstName = firstName;
        this.lastName = lastName;
        this.brand = brand;
        this.number = number;
        this.securityCode = securityCode;
        this.expiresYear = expiresYear;
        this.expiresMonth = expiresMonth;
    }
}

module.exports.Person = class Person {
    constructor(firstName, lastName, email, streetAddress, city, state, zip) {
        this.firstName = firstName;
        this.tlastName = lastName; 
        this.email = email;
        this.streetAddress = streetAddress;
        this.city = city;
        this.state = state;
        this.zip = zip;

        this.helloWorld();
    }
    helloWorld() {
        console.log('Hello WORLD!!');
    }
    hello() {
        console.log('Hello ' + this.firstName);
    }
}

const Foo = class Foo {
    static hello(msg) {
        console.log('hello world', msg)
    }
}

module.exports.Bar = class Bar {
    static hello() {
        //console.log('hello world')
        Foo.hello('calling from Bar');
    }
}

//module.exports.CreditCard = CreditCard;
//module.exports.Person = Person;