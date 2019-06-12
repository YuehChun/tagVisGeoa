
var mainType = {}
var dataTree = {}
var theT1Data = {}
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

    var theT1Item = {"st2":e.st2 ,"percent":percent, "numpeo":numpeo, "cx":e.cx, "cy":e.cy}
    if(e.t1 in theT1Data){
      if(e.local_name in theT1Data[e.t1]){
        if(e.percent>theT1Data[e.t1][e.local_name]['numpeo']){
          theT1Data[e.t1][e.local_name]=theT1Item
        }
      }else{
        theT1Data[e.t1][e.local_name]=theT1Item
      }
    }else{
      theT1Data[e.t1]={}
      theT1Data[e.t1][e.local_name]=theT1Item
    }
  });
  select_t1 = ""
  str_t1_menu = ""
  for (x in mainType){
    if(select_t1==""){
      select_t1=x
    }
    str_t1_menu+="<a class='dropdown-item' href='#' onclick='callSelectedT1(\""+x+"\");'>"+x+"</a>"
  }
  $("#t1_menu").html(str_t1_menu)
  callSelectedT1(select_t1)
}

function callSelectedT1(t1){
  $("#select_t1").html(t1)
  $("#select_st2").html("請選擇子項目")
  removeAllMapElement()
  getT1Item(t1)
  str_t2_menu = ""
  mainType[t1].map((x)=>{
    str_t2_menu+="<a class='dropdown-item' href='#' onclick='callSelectedT2(\""+t1+"\",\""+x+"\");'>"+x+"</a>"
  });
  $("#st2_menu").html(str_t2_menu)
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

function getT1Item(t1){
  var st2_bucket = {}
  var max_opacity = 0,
      min_opacity = 99999;
  for(local in theT1Data[t1]){
    st2 = theT1Data[t1][local]['st2']
    max_opacity=max_opacity<theT1Data[t1][local]['percent']?theT1Data[t1][local]['percent']:max_opacity
    min_opacity=min_opacity>theT1Data[t1][local]['percent']?theT1Data[t1][local]['percent']:min_opacity
    if(st2 in st2_bucket){
      st2_bucket[st2]+=theT1Data[t1][local]['numpeo']
    }else{
      st2_bucket[st2]=theT1Data[t1][local]['numpeo']
    }
    // console.log(item)
  }

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
      'x':theT1Data[t1][local]['cx'],
      'y':theT1Data[t1][local]['cy'],
      'radius':getRadius(theT1Data[t1][local]['numpeo']),
      'percent':theT1Data[t1][local]['percent'],
      'fillColor':st2Color[st2],
      'opacity':getOpactity(max_opacity,min_opacity,theT1Data[t1][local]['percent']),
      'numpeo':theT1Data[t1][local]['numpeo'],
      'local_name':local,
      'st2':st2
    }
    tempL_M = drawMarkerFunc(_marker)
    Leaflet_Marker.push(tempL_M);
    tempL_M.addTo(map);
    // tempL_M.addTo(_map).on('click' ,L.bind(HiLightFunc, null, _map , _marker['noName']));
  }

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
