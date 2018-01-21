import moment from 'moment'

export const phoneFormatter = (phone) => {
  if(phone)
    return phone.substr(0, 3) + '-' + phone.substr(3, 3) + '-' + phone.substr(6,4)
}
export const personIdFormatter = (id) => {
  if(id)
    return id.substr(0, 1) + '-' + id.substr(1, 4) + '-' + id.substr(5,5) + '-' + id.substr(10,2) + id.substr(12,1)
}