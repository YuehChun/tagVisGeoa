  
var mainType = {}
var dataTree = {}
var theT1Data = {}
var homeShowItem = {}
var maxVal=0
var minVal=999999999
var Leaflet_Marker = []



function getRadius(n){
  range = Math.ceil((maxVal-minVal)/7)
  return Math.ceil((n-minVal)/range)*4
}


function getOpactity(maxN,minN,n){
  var dd = (maxN-minN)/80
  var en_d = (n-minN)/dd/100
  return (en_d+0.15)
}


function getFontSiz(n){
  range = Math.ceil((maxVal-minVal)/7)
  return Math.ceil((n-minVal)/range)*4
}

function showHomeData(hData){

  var st2_bucket = {}
  var max_opacity = 0,
      min_opacity = 99999;

  for(local in hData){

    st2 = hData[local]['st2']
    max_opacity=max_opacity<hData[local]['percent']?hData[local]['percent']:max_opacity
    min_opacity=min_opacity>hData[local]['percent']?hData[local]['percent']:min_opacity
    if(st2 in st2_bucket){
      st2_bucket[st2]+=hData[local]['numpeo']
    }else{
      st2_bucket[st2]=hData[local]['numpeo']
    }
  }


  homeDataDrawMarker(hData) 

  function homeDataDrawMarker(st2_bucket){
    var items = Object.keys(st2_bucket).map(function(key) {
      return [st2_bucket[key]['st2'], st2_bucket[key]['numpeo']];
    });
      // Sort the array based on the second element
    items.sort(function(first, second) {
      return second[1] - first[1];
    });
    var st2Color = {}
    var colorNum = colorSet2.length
    console.log(items)
    items.forEach(function(k ,i){
      colorIndex = i%colorNum
      st2Color[k[0]] =  colorSet2[colorIndex]
    });
    for(local in hData){
      st2 = hData[local]['st2']
      _marker = {
        'x' : hData[local]['cx'],
        'y' : hData[local]['cy'],
        'radius' : getRadius(hData[local]['numpeo']),
        'percent' : hData[local]['percent'],
        'fillColor' : st2Color[st2],
        'opacity' : getOpactity(max_opacity,min_opacity,hData[local]['percent']),
        'numpeo' : hData[local]['numpeo'],
        'local_name' : local,
        'st2' : st2
      }
      tempL_M = drawMarkerFunc(_marker)
      Leaflet_Marker.push(tempL_M);
      tempL_M.addTo(map);
      // tempL_M.addTo(_map).on('click' ,L.bind(HiLightFunc, null, _map , _marker['noName']));
    }
  }
}

function preLoadProcess(fullData){
  fullData.forEach(function(e){
    var percent = parseFloat(e.percent)
    var numpeo = parseInt(e.numpeo)
    maxVal = maxVal<numpeo?numpeo:maxVal
    minVal = minVal>numpeo?numpeo:minVal
    // create datasturct 
    if(e.t1 in mainType){
      if(!mainType[e.t1].includes(e.st2)){
        mainType[e.t1].push(e.st2)
        dataTree[e.t1][e.st2]={}
      }
    }else{
      mainType[e.t1]= [e.st2]
      dataTree[e.t1]={}
      dataTree[e.t1][e.st2]={}
    }
    dataTree[e.t1][e.st2][e.local_name]={"percent":percent, "numpeo":numpeo, "cx":e.cx, "cy":e.cy}


    // the T1 itemset by t1
    var theT1Item = {"st2":e.st2 ,"percent":percent, "numpeo":numpeo, "cx":e.cx, "cy":e.cy}
    if(e.t1 in theT1Data){
      if(e.local_name in theT1Data[e.t1]){
        if(numpeo>theT1Data[e.t1][e.local_name]['numpeo']){
          theT1Data[e.t1][e.local_name]=theT1Item
        }
      }else{
        theT1Data[e.t1][e.local_name]=theT1Item
      }
    }else{
      theT1Data[e.t1]={}
      theT1Data[e.t1][e.local_name]=theT1Item
    }

    // local max Item
    theT1Item['t1']=e.t1
    if(e.local_name in homeShowItem){
      if(numpeo>homeShowItem[e.local_name]['numpeo']){
        homeShowItem[e.local_name]=theT1Item
      }
    }else{
      homeShowItem[e.local_name]=theT1Item
    }

  });




  select_t1 = ""
  str_t1_menu = "<a class='dropdown-item' href='#' onclick='callSelectedT1(0);'> 頂層 </a>"
  for (x in mainType){
    if(select_t1==""){
      select_t1=x
    }
    str_t1_menu+="<a class='dropdown-item' href='#' onclick='callSelectedT1(\""+x+"\");'>"+x+"</a>"
  }
  $("#t1_menu").html(str_t1_menu)
  // callSelectedT1(select_t1)

  showHomeData(homeShowItem)

}

function callSelectedT1(t1){
  if (t1==0){
    $("#select_t1").html(" 請選擇母項目 ")
    $("#select_st2").html(" 請選擇子項目 ")
    removeAllMapElement()
    $("#st2_menu").html("<a class=\"dropdown-item\" href=\"#\"> 無子項目 </a>")
    $("#T1Table1").html("<tr> <th scope=\"row\" colspan=\"5\">請選擇母項</th> </tr>")
    $("#T1Table2").html("<tr> <th scope=\"row\" colspan=\"5\">請選擇母項</th> </tr>")
    showHomeData(homeShowItem)
  }else{
    $("#select_t1").html(t1)
    $("#select_st2").html(" 請選擇子項目 ")
    removeAllMapElement()
    getT1Item(t1)
    str_t2_menu = ""
    mainType[t1].map((x)=>{
      str_t2_menu+="<a class='dropdown-item' href='#' onclick='callSelectedT2(\""+t1+"\",\""+x+"\");'>"+x+"</a>"
    });
    $("#st2_menu").html(str_t2_menu)
  }
}


function callSelectedT2(t1,st2){
  removeAllMapElement()
  $("#select_st2").html(st2)
  getST2Item(t1,st2)
}

function drawMarkerFunc(_marker){
  var newPercent = Math.round(_marker['percent']*1000)/10
  var popupHTML = "<div class='popupMap'>"+_marker['local_name']+"</div>"+
    "<div class=\"alert alert-dark popupSt2\" role=\"alert\">"+_marker['st2']+"</div>"+
    "<div >該群族人數為：<span class=\"badge badge-warning popupFont\">"+_marker['numpeo']+"</span></div>"+
    "<div >該群族占比為：<span class=\"badge badge-dark popupFont\">"+newPercent+"% </span></div>";
  var tmp_marker = L.circleMarker([_marker['y'],_marker['x']],{
    title: _marker['local_name'],
    radius:_marker['radius'],
    fillColor: _marker['fillColor'],
    fillOpacity: _marker['opacity'],
    opacity: '1.0' ,
    color:_marker['fillColor'],
    weight:'1'})
  tmp_marker.bindPopup(popupHTML);
  return tmp_marker;
}

function removeAllMapElement(){
  Leaflet_Marker.map((_LM)=>{
    _LM.remove();
  });
}

function sortT1(t1D){
  var items = Object.keys(t1D).map(function(key) {
    return [key, t1D[key]['numpeo']];
  });

  // Sort the array based on the second element
  items.sort(function(first, second) {
    return second[1] - first[1];
  });

  var sortMF = []
  items.map( (x) => {
    t1D[x[0]]['local']=x[0]
    sortMF.push(t1D[x[0]])
  });
  return sortMF
}

function getT1Item(t1){
  var st2_bucket = {}
  var max_opacity = 0,
      min_opacity = 99999;

  sortT1Sort = sortT1(theT1Data[t1])

  for(local in theT1Data[t1]){

    st2 = theT1Data[t1][local]['st2']
    max_opacity=max_opacity<theT1Data[t1][local]['percent']?theT1Data[t1][local]['percent']:max_opacity
    min_opacity=min_opacity>theT1Data[t1][local]['percent']?theT1Data[t1][local]['percent']:min_opacity
    if(st2 in st2_bucket){
      st2_bucket[st2]+=theT1Data[t1][local]['numpeo']
    }else{
      st2_bucket[st2]=theT1Data[t1][local]['numpeo']
    }
  }



  var strTable_1 = ""
  var k_i=1
  sortT1Sort.map( (x) => {
    // find the top st2 by every local
    num = new Number(x['percent']*100);
    showNum = num.toFixed(1)+"%"
    strTable_1+="<tr><th scope=\"row\">"+k_i+"</th> <td>"+x['local']+"</td> <td>"+x['st2']+"</td> <td>"+x['numpeo']+"</td> <td>"+showNum+"</td> </tr>"
    k_i+=1
  });
  $("#T1Table1").html(strTable_1)

  function SelectedT1ForDrawMarker(st2_bucket){
    var items = Object.keys(st2_bucket).map(function(key) {
      return [key, st2_bucket[key]];
    });
      // Sort the array based on the second element
    items.sort(function(first, second) {
      return second[1] - first[1];
    });
    var st2Color = {}
    var colorNum = colorSet2.length
    items.forEach(function(k ,i){
      colorIndex = i%colorNum
      st2Color[k[0]] =  colorSet2[colorIndex]
    });
    for(local in theT1Data[t1]){
      st2 = theT1Data[t1][local]['st2']
      _marker = {
        'x' : theT1Data[t1][local]['cx'],
        'y' : theT1Data[t1][local]['cy'],
        'radius' : getRadius(theT1Data[t1][local]['numpeo']),
        'percent' : theT1Data[t1][local]['percent'],
        'fillColor' : st2Color[st2],
        'opacity' : getOpactity(max_opacity,min_opacity,theT1Data[t1][local]['percent']),
        'numpeo' : theT1Data[t1][local]['numpeo'],
        'local_name' : local,
        'st2' : st2
      }
      tempL_M = drawMarkerFunc(_marker)
      Leaflet_Marker.push(tempL_M);
      tempL_M.addTo(map);
      // tempL_M.addTo(_map).on('click' ,L.bind(HiLightFunc, null, _map , _marker['noName']));
    }
  }


  function writeTable2(t1){

    var t1MaxST2={}
    for (st2 in dataTree[t1]){
      var maxItem = {}
      var maxvar = 0
      st2Item = dataTree[t1][st2]
      for(x in st2Item){
        if (st2Item[x]['percent']>maxvar){
          maxvar=st2Item[x]['percent']
          st2Item[x]['local']=x
          maxItem=st2Item[x]
        }
      }
      t1MaxST2[st2]=maxItem
    }


    // Sort the array based on the second element
    var sortSt2 = Object.keys(t1MaxST2).map(function(key) {
      return [key, t1MaxST2[key]['percent']];
    });
    sortSt2.sort(function(first, second) {
      return second[1] - first[1];
    });



    var strTable_2=""
    var k_i=1
    sortSt2.map((x) =>{
      maxItem = t1MaxST2[x[0]]
      num = new Number(maxItem['percent']*100);
      showNum = num.toFixed(1)+"%"
      strTable_2+="<tr><th scope=\"row\">"+k_i+"</th> <td>"+x[0]+"</td> <td>"+maxItem['local']+"</td> <td>"+maxItem['numpeo']+"</td> <td>"+showNum+"</td> </tr>"
      k_i+=1
    })
    $("#T1Table2").html(strTable_2)

  }

  SelectedT1ForDrawMarker(st2_bucket)
  writeTable2(t1)
}


function getST2Item(t1,st2){
  theData = dataTree[t1][st2]
  var max_opacity = 0,
      min_opacity = 99999;
  for(local in theData){
    max_opacity=max_opacity<theData[local]['percent']?theData[local]['percent']:max_opacity
    min_opacity=min_opacity>theData[local]['percent']?theData[local]['percent']:min_opacity
  }
  for(local in theData){
    _marker = {
      'x':theData[local]['cx'],
      'y':theData[local]['cy'],
      'radius':getRadius(theData[local]['numpeo']),
      'percent':theData[local]['percent'],
      'fillColor':'#333',
      'opacity':getOpactity(max_opacity,min_opacity,theData[local]['percent']),
      'numpeo':theData[local]['numpeo'],
      'local_name':local,
      'st2':st2
    }
    tempL_M = drawMarkerFunc(_marker)
    Leaflet_Marker.push(tempL_M);
    tempL_M.addTo(map);
    // tempL_M.addTo(_map).on('click' ,L.bind(HiLightFunc, null, _map , _marker['noName']));
  }

}
