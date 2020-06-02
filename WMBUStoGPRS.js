const mqtt = require("mqtt");
const fs = require("fs");
const masaUstuNODEJSfarki = -2;
const MongoClient = require("mongodb").MongoClient;

const info = {ip: "83.150.214.186", sub: "868325028814004/WM/RES", pub: "868325028814004/WM/CMD"};
//const info = {ip: "broker.mqttdashboard.com", sub: "testtopic/#"};

console.log( info );

var client = mqtt.connect("mqtt://"+info.ip);
var db;


var parolaSorgula=async()=>{
    if ( process.argv[2] ){
        let ilk = process.argv[2];
        let suan = new Date();
        let z = { saat: suan.getHours(), dakika:suan.getMinutes(), saniye:suan.getSeconds() };
        let p = ((z.saat * 7)+1);
    
        if (ilk && ilk == p){
            return 1;
        }
        else{
            return 0;
        }
    }
    else{
        return 0;
    }
    
}








var olasiDegerBul=(sabit, sabitDec, son)=>{
    // ilk değer eski hex, ikinci değer ona ait decimal, üçüncü değer son değer alani
    let ilkDec = parseInt(sabit, 16);
    let sonDec = parseInt(son, 16);
    let fark = parseInt( sonDec-ilkDec );
    let olasiDeger = sabitDec+fark;
    return olasiDeger;
}


var sayacTipiniGetir=d=>{
    let u = d.substring(20, 22);
    return u;
}

var sifirKoy=(d)=>{
    if ( d<10 ){
        return "0"+d;
    }
    return d;
}

var TCH=(p)=>{
    let sayacTipi = sayacTipiniGetir(p);
    let ayiklanmis_satir = "";
    let o = {kw:"", sayacTuru:""}    
    if ( sayacTipi == "80" ){
        // 80 değeri ısı pay ölçer demektir
        ayiklanmis_satir = p.substring( (30), (32) )+""+p.substring( (28), (30) );
        ayiklanmis_satir = parseInt( ayiklanmis_satir, 16);
        o.sayacTuru = "Pay olcer";
    }
    else if( sayacTipi == "43"){    
        // 43 değeri kalorimetre demektir
        let eski = p.substring( (masaUstuNODEJSfarki+32), (masaUstuNODEJSfarki+34) )+p.substring( (masaUstuNODEJSfarki+30), (masaUstuNODEJSfarki+32) );
        let yeni  = p.substring(masaUstuNODEJSfarki+40, masaUstuNODEJSfarki+42)+p.substring(masaUstuNODEJSfarki+38,masaUstuNODEJSfarki+40);
        let eskiDec = parseInt(eski, 16);
        let yeniDec = parseInt(yeni, 16);
        ayiklanmis_satir = (yeniDec+eskiDec);
        o.sayacTuru = "Kalorimetre";
    }
    o.kw = ayiklanmis_satir;
    return o;
}

var LUG=(p)=>{
    let o = {kw:"", sayacTuru:""} 
    let l = p.substring(44,46)+p.substring(42,44)+p.substring(40,42);
    l = parseInt(l);
    o.kw = l;
    o.sayacTuru = "Kalorimetre (Henüz Pay Ölçer test edilmedi)";
    return o;
}      

var LSE=(p)=>{
    let o = {kw:"", sayacTuru:""}    
    o.kw = p.substring(32,34)+p.substring(30,32)+p.substring(28,30);
    o.kw = parseInt( o.kw );
    o.kw 
    o.sayacTuru = "Siemens";
    return o;
    let r = {kilowatt: "", marka: ""};
    let sondakiSinyalUzunlugu = sondakiSinyalUzunlugunuGetir(hxMarka,k,p,lseMarkaKodu);



    //Qundis
    if ( sondakiSinyalUzunlugu.hex == "30"){
      let sifir = 141;
      let l = p.substring(30,32);
      console.log("LSE l hex: "+ l);
      l = parseInt(l, 16);
      console.log("LSE l dec: "+ l);
      let o = parseInt(l-sifir);
      console.log("LSE return: "+ l);
      console.log( p );
      r.kilowatt = o;
      r.marka = "Qundis";

    }
    else {
      //Siemens
      let o = p.substring(22,24)+p.substring(20,22)+p.substring(18,20);
      r.kilowatt = parseInt(o);
      r.marka = "Siemens";

    }
    return r;
  }


var marka_bul=(p)=>{
    let s = p.substring(6, 8)+p.substring(8 ,10);
    let z = new Date();
    let suan = sifirKoy(z.getHours())+":"+sifirKoy(z.getMinutes())+":"+sifirKoy(z.getSeconds())+"  "+sifirKoy(z.getDate())+"/"+sifirKoy((z.getMonth()+1))+"/"+sifirKoy(z.getFullYear());
    let o = { kod: s, ad: "", kisaAd: "", sayacTuru: "", kw:"", islemZamani:suan, islemAni: z.getTime(), hamVeri:p };
    if (s == "6850"){
        let t = TCH(p);
        o.kw = t.kw;
        o.sayacTuru = t.sayacTuru;
        o.kisaAd = "TCH";
        o.ad = "Techem";
    }
    else if (s == "a732"){
        let t = LUG(p);
        o.kw = t.kw;
        o.sayacTuru = t.sayacTuru;
        o.kisaAd = "LUG";
        o.ad = "Landis";        
    }
    else if (s == "6532"){
        let t = LSE(p);
        o.kw = t.kw;
        o.sayacTuru = t.sayacTuru;
        o.kisaAd = "LSE";
        o.ad = "Siemens/Qundis";        
    }
    return o;
}

var sayacnoBul=(p)=>{
    let s = ( p.substring(16,18) + p.substring(14,16) + p.substring(12,14) + p.substring(10,12));
    return s;
}


var sinyalUzunlugunuGetir=p=>{
    let u = p.substring(2,4);
    u = parseInt(u, 16);
    let pLength = ((p.length-2)/2);
    let o = {sinyalUzunlugu: u, tamsinyalUzunlugu:pLength};
    return o;
}


var tekSinyalse=(p)=>{
    let marka = marka_bul(p);
    let sayacNo = parseInt(sayacnoBul(p));
    
    if ( marka && marka.kw && marka.kw != "" ){
        //console.log( {sayacNo:sayacNo, marka: marka} );  
        let satir = {sayacNo:sayacNo, markaKodu:marka.kod, markaAdi:marka.ad, markaKisaAd: marka.kisaAd, sayacTuru:marka.sayacTuru, kw:marka.kw, islemZamani:marka.islemZamani, islemAni:marka.islemAni, hamVeri:marka.hamVeri};
        //db.collection("anlikKayitlar").insertOne(satir);  
    }
    else{
        console.log( {sayacNo:sayacNo, marka: marka} );  
    }

}

var cokluSinyalse=(p)=>{
    gelenVeriGetir(p);
}



var sinyalUzunlugunaGoreAyir=(p)=>{
    p = p.toLowerCase();
    let sinyalUzunlugu = sinyalUzunlugunuGetir(p);

    if ( sinyalUzunlugu.tamsinyalUzunlugu  == sinyalUzunlugu.sinyalUzunlugu ){
        console.log("Sinyal Uzunluğu eşit veya az");
        tekSinyalse(p);        
    }
    else if( sinyalUzunlugu.tamsinyalUzunlugu > sinyalUzunlugu.sinyalUzunlugu  ){
        console.log("Sinyal Uzunluğu Gerekenden Büyük");
        cokluSinyalse(p);
    }
    return p;
}

var oncekiDegerdenUzunlukGetir=(Hx_LER, k)=>{
    if ( Hx_LER[k-1] ){
        let islenecekDizi = Hx_LER[k-1];
        let ilkBolum = islenecekDizi.substring(islenecekDizi.length-6,islenecekDizi.length);
        return ilkBolum;
    }
    else{
        return "";
    }
}

var sinyalinBoyutunuGetir=(p)=>{
    let o = {hex:"", dec:""}
    o.hex = p.substring( 2,4 );
    o.dec = parseInt(parseInt(o.hex, 16)*2);
    return o;
}

var sinyaliBoyutaGoreKirp=(p)=>{
    let dec = sinyalinBoyutunuGetir(p).dec;
    let o = p.substring(0, (dec+4) );
    return o;
}


var parcalaVEbirlestir=(Hx_LER, markaKodu)=>{
    let tasarlanmisHex = [];
    
    if ( Hx_LER && Hx_LER.length>0 ){
        Hx_LER.forEach((v,k)=>{
            if ( v.length> 20 ){
                let p = oncekiDegerdenUzunlukGetir(Hx_LER, k)+""+markaKodu+""+v;
                let DogruP = sinyaliBoyutaGoreKirp(p);
                tekSinyalse(DogruP);
            }            
        });
    }
    else{
        Hx_LER = Hx_LER;
    }

    return Hx_LER;
}


var gelenVeriGetir=p=>{
    parcalaVEbirlestir( p.split("6850"), "6850" );
    parcalaVEbirlestir( p.split("8d15"), "8d15" );
    parcalaVEbirlestir( p.split("a732"), "a732" );
    parcalaVEbirlestir( p.split("6532"), "6532" );
} 
  


parolaSorgula().then((d)=>{
    if ( d == 1 ){

        MongoClient.connect("mongodb://localhost",{ useUnifiedTopology: true }, (MongoErr, MongoRes)=>{
            if ( MongoErr ) throw error;
            db = MongoRes.db("sayacTakipSistemi");
            console.log("#########################################");
            console.log("#    Veritabanı Bağlantısı Başarılı     #");
            console.log("#########################################");

            client.on("connect", ()=>{
                client.subscribe(info.sub);
            });
            
            client.on("message", (topic, message)=>{
                let p = message.toString("hex");
                sinyalUzunlugunaGoreAyir(p);
                let marka = marka_bul(p);
                let sayacNo = sayacnoBul(p);
                console.log(" --> Ham Veri --> ");
                console.log( {topic: topic, message: p, stringMessage: message.toString(), sayacNo:sayacNo, marka: marka} );
                console.log(" ---------------- ");
                fs.appendFileSync("cikti.db", message)
            });

            //var pt = "FF36446850809271414543A11F2734A50008F20A0080F883E5964B0BA63DF500000000000000000000000000000004644A7B0DDE27E3FE";
            var pt = "FF36446850879271414543A1001F27898F00100000008005000000000000000000000000000000000000000000000000000000000000000003FF364424234404904854477AB600287A6866467483B287D7EBFC83E762EF53E9302A232C5A109DF9267395E0F98B5B9AD89BF3C3F1F04520004F4B0D4F4B0D4F4B0DFF48446532134563762C08780B6E0000000DFF5F2F00010098000608B06E642B7F2C000000009F2100000000000000000000000000000000000000800080000000000000046D34078B2203FF30446532687831802C087A53180000046D34078B22025AEF0001FD0C06326C562C0DFF5F0C0008673024810714080BFFFC03FF48446532134563762C08780B6E0000000DFF5F2F00010098820508B06E642B7F2C000000009F2100000000000000000000000000000000000000800080000000000000046D36078B2203FF48446532134563762C08780B6E0000000DFF5F2F00010098000508B06E642B7F2C000000009F2100000000000000000000000000000000000000800080000000000000046D38078B220348446532134563762C08780B6E0000000DFF5F2F000100987E0408B06E642B7F2C000000009F2100000000000000000000000000000000000000800080000000000000046D3B078B2203FF48446532801504722A08780B6E6200000DFF5F2F0001E488803808B06E43297F2C000000009F2115000000000000000000000000000000000000000000000000000F00046D06088B2200";
            //pt = Buffer.from(pt);
            //sinyalUzunlugunaGoreAyir(pt);
        });

    }
});
