class Requests {
    static requestBody(itemInterface, requiredValues ) {
        return {
            type: 'object',
            additionalProperties: false,
            properties: itemInterface,
            required: requiredValues
        }
    }

}

export default Requests;