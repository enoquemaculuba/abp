class Responses {
    static errorResponseObj(){
        return {
            type: 'object',
            properties: {
                code: { type: 'number' },
                message: { type: 'string' },
                error: {type: 'string'}
            }
        }
    }

    static successResponseObj(itemInterface){
        return {
            type: 'object',
            properties: {
                code: { type: 'number' },
                message: { type: 'string' },
                success: {type: 'string'},
                data: {
                    type: 'array', items: {
                        type: 'object',
                        properties: {
                            ...itemInterface
                        }
                    }
                }
            }
        }
    }
}


export default Responses;