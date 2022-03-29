import {AccessControl} from 'accesscontrol'

const ac = new AccessControl();

ac.grant('admin')
    .createAny('blog')
    .deleteAny('blog')
    .readAny('blog')

ac.lock();

export {ac}