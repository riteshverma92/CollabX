const getShapeObject = (tool , start , end) =>{

    const shapeObject = {
        type : tool,
        x : start.x,
        y : start.y,
        width : end.x - start.x,
        height : end.y - start.y 
    
    }

    return  shapeObject ;
}

export default  getShapeObject;