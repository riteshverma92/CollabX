const drawShape = (ctx, shape) => {
  ctx.beginPath();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  let { type, x, y, width, height } = shape;

  if(type === "rect"){
        ctx.rect(x, y, width , height);

  }

  if(type === "circle"){

    const r = Math.sqrt (width* width + height* height);
    ctx.arc(x , y , r , 0 , Math.PI *2);

  }

  if(type == "line"){

    ctx.moveTo (x, y);
    ctx.lineTo(x+width , y+height);


  }



  ctx.stroke();





};

export default drawShape;
