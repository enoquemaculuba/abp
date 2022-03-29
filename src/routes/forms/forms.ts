import {FastifyInstance} from "fastify";
import * as Forms from "../../@types/forms"
import dotenv from "dotenv";

dotenv.config();

const sendMail = (nodemailer:any, email:string, subject:string, message:string) =>{
    return new Promise((resolve, reject) => {
        nodemailer.sendMail({
            from: process.env.EMAIL,
            to: process.env.EMAIL,
            copy: email,
            subject: subject,
            text: message
        }, (err, info) => {
            console.log('err', err, info)
            if(err){
                resolve({success: false, error:{message: err}})
            }else{
                resolve({success: true})
            }
        })
    })
}

export default (app: FastifyInstance, options, done) => {
    app.route<{Body:Forms.ContactUs}>({
        method: 'POST',
        url:'/API/contact-us',
        schema: {
            description:'Contact us',
            tags:['forms'],
            body: Forms.contactUs,
            response: {
                200: Forms.MailResponse
            }
        },
        handler: async (req, res) => {
            const {fullName, subject, email, message} = req.body;
            let { nodemailer } = app
            return await sendMail(nodemailer, email, subject, message)
        }
    })
    app.route<{Body:Forms.EquipmentRent}>({
        method: 'POST',
        url:'/API/equipment-rent',
        schema: {
            description:'Contact us',
            tags:['forms'],
            body: Forms.equipmentRent,
            response: {
                200: Forms.MailResponse
            }
        },
        handler: async (req, res) => {
            const {body} = req;
            let { nodemailer } = app
            const rentalTime = new Date(body.rentalTime)
            const message =
                `
This is an automatic response.

Thank you for your rental request!

Your request for beer pong equipment rental information:
Name: ${body.name}
Telegram: ${body.telegram}
e-mail: ${body.email}
Phone number: ${body.phoneNumber}
I'm renting as: ${body.rentingAs}
Organization: ${body.rentingAsInfo??'-'}
Amount of tables: ${body.tables}
Rental time: ${rentalTime.toLocaleString()}
Dates for collecting the tables:
Option 1: ${new Date(body.pickDate1).toLocaleString()}
Option 2: ${body.pickDate2 == undefined ? '-' : new Date(body.pickDate2).toLocaleString()}
Option 3: ${body.pickDate3 == undefined ? '-' : new Date(body.pickDate3).toLocaleString()}
Additional info: ${body.message??''}

We will contact you soon!

Best regards,
Aalto Beer Pong
`
            return await sendMail(nodemailer, body.email, `Beer Pong equipment rental ${rentalTime.toLocaleDateString()}`, message)
        }
    })

    app.route<{Body:Forms.JoinUs}>({
        method: 'POST',
        url:'/API/join-us',
        schema: {
            description:'Join us',
            tags:['forms'],
            body: Forms.joinUs,
            response: {
                200: Forms.MailResponse
            }
        },
        handler: async (req, res) => {
            const {body} = req;
            let { nodemailer } = app
            const message =
                `
This is an automatic response.

Thank you for wanting to join our association.
We will now process your submission and decide if we can take you as a member of ABP.

You submitted:
Name: ${body.name}
Telegram: ${body.telegram??'-'}
Member of AYY: ${body.isMemberOfAYY}
Hometown: ${body.hometown}
School: ${body.school}
Accepted the policy: ${body.acceptedPolicy}

We will let you know when you have been accepted.

Best regards,
Aalto Beer Pong
`
            return await sendMail(nodemailer, body.email, 'Join Aalto Beer Pong', message)
        }
    })
    done()
}
