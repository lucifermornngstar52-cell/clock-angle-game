/* ═══ ХРОНО-ЕНТ — тренажёр заданий ЕНТ по математике ═══
   Банк генерируется при загрузке: шаблоны с рандомными параметрами,
   ответы и ловушки-дистракторы построены на типичных ошибках. */
var ENT_BANK=[];
(function(){
  var R=function(a,b){return Math.floor(Math.random()*(b-a+1))+a;};
  var CH=function(a){return a[R(0,a.length-1)];};
  function fmt(x){
    if(Math.abs(x-Math.round(x))<1e-9)return String(Math.round(x));
    return (Math.round(x*100)/100).toString().replace('.',',');
  }
  function frac(a,b){
    function g(x,y){while(y){var t=x%y;x=y;y=t;}return x;}
    var d=g(a,b)||1;a/=d;b/=d;return b===1?String(a):(a+'/'+b);
  }
  function plu(n,one,few,many){ // русская плюрализация
    var n10=n%10,n100=n%100;
    if(n10===1&&n100!==11)return n+' '+one;
    if(n10>=2&&n10<=4&&(n100<10||n100>=20))return n+' '+few;
    return n+' '+many;
  }
  function Q(d,t,q,ans,dist,sol,raw){
    var aStr=(raw?String(ans):fmt(ans));
    var opts=[aStr], seen={}; seen[aStr]=1;
    for(var i=0;i<dist.length;i++){
      var s=(raw?String(dist[i]):fmt(dist[i]));
      if(!seen[s]){seen[s]=1;opts.push(s);}
    }
    if(opts.length<5){
      if(raw&&/[π]/.test(aStr)){ // заполнение для ответов с π
        var base=parseInt(aStr,10)||1,k=2;
        while(opts.length<5){var js=(base+k)+'π';k+=3;if(!seen[js]){seen[js]=1;opts.push(js);}}
      } else if(raw&&aStr.indexOf('/')>-1){
        // дробные ответы: варьируем числитель
        var nn=parseInt(aStr,10),dn=parseInt(aStr.slice(aStr.indexOf('/')+1),10)||6,k2=1;
        while(opts.length<5&&k2<8){
          var alt=frac(nn+k2*2,dn);k2++;
          if(alt&&!seen[alt]){seen[alt]=1;opts.push(alt);}
        }
        if(opts.length<5){var alt2=(nn+k2)+'/'+dn;if(!seen[alt2]){seen[alt2]=1;opts.push(alt2);}}
      } else if(raw){
        // для строковых ответов доворачиваем варианты добавкой ±
        var k2=1;
        while(opts.length<5&&k2<6){
          var m=aStr.indexOf('>');
          var alt=(m>-1)?aStr.slice(0,m+1)+(parseInt(aStr.slice(m+1),10)+k2*2):aStr+'·'+k2;
          k2++;
          if(alt&&!seen[alt]){seen[alt]=1;opts.push(alt);}
        }
      } else {
        var k3=1;
        while(opts.length<5){
          var js2=fmt(ans+k3*R(1,9));k3++;
          if(!seen[js2]){seen[js2]=1;opts.push(js2);}
        }
      }
    }
    opts=opts.slice(0,5);
    for(var m2=opts.length-1;m2>0;m2--){var r2=R(0,m2),tmp=opts[m2];opts[m2]=opts[r2];opts[r2]=tmp;}
    ENT_BANK.push({q:q,o:opts,c:opts.indexOf(aStr),s:sol,d:d,t:t});
  }
  // Q с гарантией 5 уникальных опций: перегенерируем условие, пока не выйдет
  function QU(gen){ // gen() возвращает {d,t,q,ans,dist,sol,raw}
    for(var tries=0;tries<40;tries++){
      var g=gen();
      var all=[String(g.ans)].concat(g.dist.map(String));
      var uniq={};var n=0;
      for(var i=0;i<all.length;i++){if(!uniq[all[i]]){uniq[all[i]]=1;n++;}}
      if(n>=5){Q(g.d,g.t,g.q,g.ans,g.dist,g.s,g.raw);return;}
    }
    var g2=gen();
    Q(g2.d,g2.t,g2.q,g2.ans,g2.dist||[],g2.s,g2.raw); // fallback — редкий случай
  }

  var NAMES=['Асхат','Дана','Ерлан','Айгерим','Марат','Алия','Тимур','Мадина','Санжар','Камила'];
  function nm(){return CH(NAMES);}
  function ft(H,M){return (H<10?'0':'')+H+':'+(M<10?'0':'')+M;}

  /* ── D1: базовый (математическая грамотность) ── */

  function T1(){var P=CH([1250,2400,3750,4800,6400,8800,12500,16000,24500,36000]),k=CH([10,15,20,25,30,40,50]);
    QU(function(){return {d:1,t:'Проценты',
      q:'Куртка стоит '+fmt(P)+' тг. Скидка '+k+'%. Сколько стоит куртка со скидкой?',
      ans:P*(1-k/100),dist:[P*k/100,P*(1+k/100),P-P*k/200,P*(1-k/100)/2],
      s:fmt(P)+' − '+fmt(P)+'·'+k+'/100 = '+fmt(P*(1-k/100))+' тг'};});}
  function T2(){var З=CH([80000,90000,100000,120000,140000,150000,180000,200000,250000]),p=CH([10,15,20,25,30]);
    QU(function(){return {d:1,t:'Проценты',
      q:'У '+nm()+' зарплата — '+fmt(З)+' тг. Её повысили на '+p+'%. Какой стала зарплата?',
      ans:З*(1+p/100),dist:[З*p/100,З*(1-p/100),З+p,З*(1+p/200)],
      s:fmt(З)+' + '+fmt(З)+'·'+p+'/100 = '+fmt(З*(1+p/100))+' тг'};});}
  function T3(){var a=R(2,9),y=R(2,12),p=R(120,900);p=Math.round(p/10)*10;var S=a*p;
    QU(function(){return {d:1,t:'Пропорции',
      q:a+' кг конфет стоят '+fmt(S)+' тг. Сколько стоят '+y+' кг?',
      ans:y*p,dist:[S*y/a*10,S/a,S*y,(y-a)*p],
      s:fmt(S)+' / '+a+' = '+fmt(p)+' тг за кг → '+fmt(p)+'·'+y+' = '+fmt(y*p)+' тг'};});}
  function T4(){var nums=[],s=0;for(var i=0;i<4;i++){var n=R(3,40);nums.push(n);s+=n;}
    var y=R(3,40),m=(s+y)/5;
    QU(function(){return {d:1,t:'Средние',
      q:'Четыре числа: '+nums.join(', ')+'. К ним добавили '+y+'. Чему равно среднее арифметическое пяти чисел?',
      ans:m,dist:[s/4,y,s+y,(s-y)/5],
      s:'сумма = '+fmt(s+y)+', делим на 5 → '+fmt(m)};});}
  function T5(){var v=R(40,90),t=R(2,6);
    QU(function(){return {d:1,t:'Движение',
      q:'Автобус едет со скоростью '+v+' км/ч. Какой путь он пройдёт за '+plu(t,'час','часа','часов')+'?',
      ans:v*t,dist:[v+t,v/t,v*t/2,2*v*t],
      s:'S = v·t = '+v+'·'+t+' = '+fmt(v*t)+' км'};});}
  function T6(){var p=CH([5,12,15,20,25,35,40,60,75]),N=CH([200,300,400,600,800,1200,1500,2400]);
    QU(function(){return {d:1,t:'Проценты',
      q:'Найдите '+p+'% от числа '+fmt(N)+'.',
      ans:p*N/100,dist:[N/p,N/100,p*N,N*(100-p)/100],
      s:fmt(N)+'·'+p+'/100 = '+fmt(p*N/100)};});}
  function T7(){var h=R(10,21),m=CH([0,10,15,20,25,30,35,40,45,50,55]);
    var dh=R(1,3),dm=CH([15,20,25,30,35,40,45,50,55]);
    var em=m+dm,eh=h+dh+Math.floor(em/60);em=em%60;
    var ok=ft(eh,em);
    QU(function(){return {d:1,t:'Время',raw:true,
      q:'Фильм начался в '+ft(h,m)+' и длится '+dh+' ч '+dm+' мин. Во сколько он закончится?',
      ans:ok,dist:[ft((eh*60+em+30)%1440===0?23:Math.floor(((eh*60+em+30)%1440)/60),((eh*60+em+30)%60)),
                   ft((eh*60+em+60)%1440===0?23:Math.floor(((eh*60+em+60)%1440)/60),((eh*60+em+60)%60)),
                   ft((h+dh)%24,m),ft(h,(m+dm)%60)],
      s:ft(h,m)+' + '+dh+' ч '+dm+' мин = '+ok};});}
  function T8(){var a=R(4,25),b=R(3,20);
    if(CH([0,1]))
      QU(function(){return {d:1,t:'Геометрия',
        q:'Стороны прямоугольника '+a+' см и '+b+' см. Найдите периметр.',
        ans:2*(a+b),dist:[a*b,a+b,(a+b)/2,4*a],
        s:'P = 2·('+a+'+'+b+') = '+fmt(2*(a+b))+' см'};});
    else
      QU(function(){return {d:1,t:'Геометрия',
        q:'Стороны прямоугольника '+a+' см и '+b+' см. Найдите площадь.',
        ans:a*b,dist:[2*(a+b),a+b,2*a*b,a*a],
        s:'S = '+a+'·'+b+' = '+fmt(a*b)+' см²'};});}
  function T9(){var red=R(2,6),blue=R(2,7),green=R(1,4),tot=red+blue+green;
    QU(function(){return {d:1,t:'Вероятность',raw:true,
      q:'В урне '+red+' красных, '+blue+' синих и '+green+' зелёных '+plu(red+blue+green,'шар','шара','шаров')+'. Какова вероятность вынуть красный шар?',
      ans:frac(red,tot),dist:[frac(blue,tot),frac(tot,red),frac(red,blue),frac(red+blue,tot)],
      s:'P = '+red+'/'+tot+' = '+frac(red,tot)};});}
  function T10(){var ans=CH([5,10,15,20,25,30,40,50,60,75,80]),B=CH([40,60,80,100,120,150,200,240,300,400]);
    var A=B*ans/100;
    QU(function(){return {d:1,t:'Проценты',
      q:'Сколько процентов составляет '+fmt(A)+' от '+fmt(B)+'?',
      ans:ans,dist:[100-ans,ans/2,B/A,ans*2],
      s:fmt(A)+'/'+fmt(B)+'·100 = '+ans+'%'};});}
  function T11(){var g=R(8,15),d=R(8,15),n=g+d;
    QU(function(){return {d:1,t:'Текстовые',
      q:'В классе '+n+' учеников, девочек на '+Math.abs(g-d)+' больше, чем мальчиков. Сколько девочек в классе?',
      ans:Math.max(g,d),dist:[Math.min(g,d),n/2,n-Math.max(g,d),n],
      s:'Пусть мальчиков x: x + (x+'+Math.abs(g-d)+') = '+n+' → девочек = '+Math.max(g,d)};});}
  function T12(){var h=R(2,6),m=CH([10,15,20,25,30,35,40,45,50]);
    QU(function(){return {d:1,t:'Время',
      q:'Поезд в пути '+h+' ч '+m+' мин. Сколько это минут?',
      ans:h*60+m,dist:[h+m,h*60,h*6+m,h*100+m],
      s:h+'·60 + '+m+' = '+fmt(h*60+m)+' мин'};});}

  /* ── D2: средний ── */

  function T13(){var r1=R(1,6),r2=R(7,12);var S=r1+r2,P=r1*r2;
    QU(function(){return {d:2,t:'Уравнения',
      q:'x² − '+S+'x + '+P+' = 0. Найдите больший корень.',
      ans:r2,dist:[r1,-r2,S,P],
      s:'По Виету: x1+x2 = '+S+', x1·x2 = '+P+' → корни '+r1+' и '+r2};});}
  function T14(){var t=R(2,5),v1=R(40,80),v2=R(50,90);var S=(v1+v2)*t;
    QU(function(){return {d:2,t:'Движение',
      q:'Из двух городов, расстояние между которыми '+S+' км, одновременно навстречу выехали два автомобиля со скоростями '+v1+' и '+v2+' км/ч. Через сколько часов они встретятся?',
      ans:t,dist:[S/v1,S/v2,v1+v2,S/(v1+v2)+1],
      s:'Сближение: '+v1+'+'+v2+' = '+(v1+v2)+' км/ч → '+S+'/'+(v1+v2)+' = '+t+' ч'};});}
  function T15(){var p=CH([[3,6],[4,12],[12,4],[5,20],[20,5],[2,2],[4,4],[6,2],[10,15]]),t1=p[0],t2=p[1];
    var ans=1/(1/t1+1/t2);
    QU(function(){return {d:2,t:'Работа',
      q:'Один мастер выполняет заказ за '+plu(t1,'день','дня','дней')+', другой — за '+plu(t2,'день','дня','дней')+'. За сколько дней они выполнят заказ вместе?',
      ans:ans,dist:[(t1+t2)/2,t1*t2/(t1+t2),Math.max(t1,t2),t1+t2],
      s:'Скорости: 1/'+t1+' + 1/'+t2+' = '+fmt(1/t1+1/t2)+' заказа в день → '+fmt(ans)+' дня'};});}
  function T16(){var a1=R(2,20),d=R(2,9),n=R(5,15);var an=a1+d*(n-1);
    QU(function(){return {d:2,t:'Прогрессии',
      q:'Арифметическая прогрессия: a₁ = '+a1+', d = '+d+'. Найдите a('+n+').',
      ans:an,dist:[a1+d*n,a1-d*(n-1),a1*n,a1+d],
      s:'a('+n+') = '+a1+' + '+d+'·'+(n-1)+' = '+an};});}
  function T17(){var b1=R(1,5),q=CH([2,3]),n=R(4,7);var bn=b1*Math.pow(q,n-1);
    QU(function(){return {d:2,t:'Прогрессии',
      q:'Геометрическая прогрессия: b₁ = '+b1+', q = '+q+'. Найдите b('+n+').',
      ans:bn,dist:[b1*Math.pow(q,n),b1*q,b1*Math.pow(q,n-2),b1*n],
      s:'b('+n+') = '+b1+'·'+q+'^'+(n-1)+' = '+bn};});}
  function T18(){var tr=CH([[3,4,5],[6,8,10],[5,12,13],[9,12,15],[8,15,17],[12,16,20],[7,24,25]]);
    if(CH([0,1]))
      QU(function(){return {d:2,t:'Геометрия',
        q:'Катеты прямоугольного треугольника равны '+tr[0]+' и '+tr[1]+'. Найдите гипотенузу.',
        ans:tr[2],dist:[tr[0]+tr[1],tr[2]+1,tr[0]*tr[1],tr[2]-2],
        s:'c² = '+tr[0]+'² + '+tr[1]+'² = '+(tr[0]*tr[0]+tr[1]*tr[1])+' → c = '+tr[2]};});
    else
      QU(function(){return {d:2,t:'Геометрия',
        q:'Гипотенуза прямоугольного треугольника равна '+tr[2]+', один катет — '+tr[0]+'. Найдите второй катет.',
        ans:tr[1],dist:[tr[2]-tr[0],tr[0],tr[2]+tr[0],tr[1]+2],
        s:'b² = '+tr[2]+'² − '+tr[0]+'² = '+(tr[2]*tr[2]-tr[0]*tr[0])+' → b = '+tr[1]};});}
  function T19(){var r=CH([2,3,4,5,6,7,8,9,10,12]);
    if(CH([0,1]))
      QU(function(){return {d:2,t:'Геометрия',raw:true,
        q:'Радиус окружности равен '+r+'. Найдите длину окружности (ответ с π).',
        ans:(2*r)+'π',dist:[r+'π',(r*r)+'π',(2*r*r)+'π',(2*r+1)+'π'],
        s:'C = 2πR = 2π·'+r+' = '+(2*r)+'π'};});
    else
      QU(function(){return {d:2,t:'Геометрия',raw:true,
        q:'Радиус круга равен '+r+'. Найдите площадь круга (ответ с π).',
        ans:(r*r)+'π',dist:[(2*r)+'π',r+'π',(2*r*r)+'π',(r*r+1)+'π'],
        s:'S = πR² = π·'+r+'² = '+(r*r)+'π'};});}
  function T20(){var a=R(25,80),b=R(25,153-a);
    QU(function(){return {d:2,t:'Геометрия',
      q:'Два угла треугольника равны '+a+'° и '+b+'°. Найдите третий угол.',
      ans:180-a-b,dist:[a+b,90-a,360-a-b,180-a],
      s:'180 − '+a+' − '+b+' = '+fmt(180-a-b)+'°'};});}
  function T21(){var P=CH([500,1000,2000,5000,10000,20000,50000]),k1=CH([10,20,25]),k2=CH([10,20,25]);
    QU(function(){return {d:2,t:'Проценты',
      q:'Цену '+fmt(P)+' тг снизили на '+k1+'%, затем повысили на '+k2+'%. Какова новая цена?',
      ans:P*(1-k1/100)*(1+k2/100),dist:[P*(1-k1/100),P,P*(1+(k2-k1)/100),P*(1+k2/100)],
      s:fmt(P)+'·'+fmt(1-k1/100)+'·'+fmt(1+k2/100)+' = '+fmt(P*(1-k1/100)*(1+k2/100))+' тг'};});}
  function T22(){var x=R(10,40),y=R(3,9),S=x+y,D=x-y;
    QU(function(){return {d:2,t:'Уравнения',
      q:'Сумма двух чисел равна '+S+', разность — '+D+'. Найдите большее число.',
      ans:x,dist:[y,S/2,S,D],
      s:'x = ('+S+'+'+D+')/2 = '+x};});}
  function T23(){var set=CH([[7,6],[5,4],[6,5],[8,5],[9,4],[10,3]]);var sum=set[0],fav=set[1];
    QU(function(){return {d:2,t:'Вероятность',raw:true,
      q:'Бросают два кубика. Какова вероятность, что сумма выпавших очков равна '+sum+'?',
      ans:frac(fav,36),dist:[frac(1,6),frac(1,12),frac(5,36),frac(1,9)],
      s:'Благоприятных исходов: '+fav+' из 36 → '+frac(fav,36)};});}
  function T24(){var a=R(3,9),b=R(3,9);
    QU(function(){return {d:2,t:'Степени',
      q:'2^'+a+' · 2^'+b+' = 2^x. Найдите x.',
      ans:a+b,dist:[a*b,a-b,a+b+1,a*b-1],
      s:'При умножении степеней показатели складываются: '+a+' + '+b+' = '+(a+b)};});}

  /* ── D3: профильный ── */

  function T25(){var set=CH([[2,128],[2,512],[3,243],[3,81],[5,125],[5,625],[4,256],[7,343]]);
    var b=set[0],v=set[1],e=Math.round(Math.log(v)/Math.log(b));
    QU(function(){return {d:3,t:'Логарифмы',
      q:'Вычислите log('+b+') '+v+'.',
      ans:e,dist:[e+1,e-1,v/b,b],
      s:b+'^'+e+' = '+v+' → ответ '+e};});}
  function T26(){var set=CH([
      ['sin 30° + cos 60°','1',['0,5','√3','2','1,5']],
      ['tg 45° · sin 90°','1',['0','√2','2','0,5']],
      ['cos 90° + sin 0°','0',['1','0,5','2','−1']],
      ['sin² 60° + cos² 60°','1',['0,5','2','√3/2','0,75']],
      ['2 · sin 30°','1',['2','0,5','√2','1,5']],
      ['tg 30° · ctg 30°','1',['3','√3','0','1/3']],
      ['sin 90° − cos 0°','0',['1','2','0,5','−1']],
      ['cos 60° : sin 30°','1',['2','0,5','0,25','√3']],
      ['sin 45° · cos 45°','0,5',['1','√2','0,25','√2/2']],
      ['ctg 60° · tg 60°','1',['3','1/3','√3','0']]]);
    var q=set[0],ans=set[1],dis=set[2];
    QU(function(){return {d:3,t:'Тригонометрия',raw:true,
      q:'Вычислите: '+q+'.',ans:ans,dist:dis,
      s:'По таблице значений: '+q+' = '+ans};});}
  function T27(){var a=R(1,4),b=R(2,9),x0=CH([1,2]);
    QU(function(){return {d:3,t:'Производная',
      q:'f(x) = '+a+'x³ + '+b+'x². Найдите f′('+x0+').',
      ans:3*a*x0*x0+2*b*x0,dist:[3*a+2*b,3*a*x0*x0,2*b*x0,3*a*x0+2*b],
      s:'f′(x) = '+(3*a)+'x² + '+(2*b)+'x → f′('+x0+') = '+(3*a)+'·'+(x0*x0)+' + '+(2*b)+'·'+x0+' = '+fmt(3*a*x0*x0+2*b*x0)};});}
  function T28(){var b=CH([2,3,5]),k=R(3,7),sh=R(1,4);var tar=Math.pow(b,k);
    QU(function(){return {d:3,t:'Уравнения',
      q:'Решите уравнение: '+b+'^(x−'+sh+') = '+tar+'.',
      ans:k+sh,dist:[k-sh,k,sh-k,k*sh],
      s:b+'^(x−'+sh+') = '+b+'^'+k+' → x − '+sh+' = '+k+' → x = '+(k+sh)};});}
  function T29(){var set=CH([[5,2,10],[6,2,15],[7,2,21],[4,2,6],[8,2,28],[6,3,20],[5,3,10]]);
    var n=set[0],k=set[1],v=set[2];
    QU(function(){return {d:3,t:'Комбинаторика',
      q:'Сколькими способами можно выбрать '+k+' предмета из '+n+' различных?',
      ans:v,dist:[n*k,n-k,n*2,n*(n-1)],
      s:'C('+n+','+k+') = '+n+'!/(('+k+'!)·'+(n-k)+'!) = '+v};});}
  function T30(){var qs=CH([[1,2],[1,3],[1,4]]),b1=CH([6,12,18,24,30]);
    var S=b1/(1-qs[0]/qs[1]);
    QU(function(){return {d:3,t:'Прогрессии',
      q:'Найдите сумму бесконечно убывающей геометрической прогрессии: b₁ = '+b1+', q = '+qs[0]+'/'+qs[1]+'.',
      ans:S,dist:[b1,b1/(1+qs[0]/qs[1]),b1*qs[0]/qs[1],S/2],
      s:'S = b₁/(1−q) = '+b1+'/(1−'+qs[0]+'/'+qs[1]+') = '+fmt(S)};});}
  function T31(){var a=R(2,5),b=R(3,15),x0=R(2,9);
    var c=a*x0+b;
    QU(function(){return {d:3,t:'Неравенства',raw:true,
      q:'Решите неравенство: '+a+'x + '+b+' > '+c+'.',
      ans:'x > '+x0,dist:['x < '+x0,'x > '+(x0+1),'x ≥ '+x0,'x < −'+x0],
      s:a+'x > '+(c-b)+' → x > '+x0};});}
  function T32(){var r1=R(1,6),r2=R(3,9);var S=r1+r2,P=r1*r2;
    QU(function(){return {d:3,t:'Уравнения',
      q:'x² − '+S+'x + '+P+' = 0 имеет корни x₁ и x₂. Найдите x₁² + x₂².',
      ans:S*S-2*P,dist:[S*S+2*P,S*S,S*P,S*S-P],
      s:'x₁²+x₂² = (x₁+x₂)² − 2x₁x₂ = '+S+'² − 2·'+P+' = '+fmt(S*S-2*P)};});}

  var TPL=[T1,T2,T3,T4,T5,T6,T7,T8,T9,T10,T11,T12,T13,T14,T15,T16,T17,T18,T19,T20,T21,T22,T23,T24,T25,T26,T27,T28,T29,T30,T31,T32];
  for(var i=0;i<TPL.length;i++)for(var j=0;j<7;j++)TPL[i]();

  // дедупликация по тексту
  var seen={},out=[];
  for(var i2=0;i2<ENT_BANK.length;i2++){var b=ENT_BANK[i2];if(!seen[b.q]){seen[b.q]=1;out.push(b);}}
  ENT_BANK=out;
  window.ENT_BY_D={};
  [1,2,3].forEach(function(d){window.ENT_BY_D[d]=ENT_BANK.filter(function(q){return q.d===d;});});
})();
