import { Static, Type } from '@sinclair/typebox'

export const contactUs = Type.Object({
    fullName: Type.String(),
    email: Type.String(),
    subject: Type.String(),
    message: Type.String(),
})
export type ContactUs = Static<typeof contactUs>

export const joinUs = Type.Object({
    name: Type.String(),
    email: Type.String(),
    telegram: Type.Optional(Type.String()),
    isMemberOfAYY: Type.String(),
    hometown: Type.String(),
    school: Type.String(),
    acceptedPolicy: Type.String()
})
export type JoinUs = Static<typeof joinUs>

export const equipmentRent = Type.Object({
    name: Type.String(),
    email:  Type.String(),
    telegram:  Type.String(),
    phoneNumber:  Type.String(),
    rentingAs:  Type.String(),
    rentingAsInfo:Type.Optional( Type.String()),
    organization: Type.Optional( Type.String()),
    tables: Type.Number(),
    rentalTime: Type.String(),
    pickDate1: Type.String(),
    pickDate2: Type.Optional( Type.String()),
    pickDate3: Type.Optional( Type.String()),
    message: Type.Optional( Type.String()),
})

export type EquipmentRent = Static<typeof equipmentRent>

export const MailResponse = Type.Object({
    success: Type.Boolean(),
    error:Type.Optional(Type.Object({
        message:Type.String(),
    }))
})