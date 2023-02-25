import { useState } from 'react'
import Form from 'react-bootstrap/Form'

const categories = [
  'Apetizer',
  'Beverage',
  'Breakfast',
  'Comfort food',
  'Lunch',
  'Salad',
  'Smothie',
  'Snack',
  'Soup',
  'Vegan',
  'Savoury',
  'Sweet'
]

const Toggles = props => {
  
  const sendDataBacktoHome = data => {
    props.sendData(data)
  }
  const [switchState, setSwitchState] = useState(false)
  const handleChange = function (e, item) {
    let data = {condition: e.target.checked, value: item}
    console.log('data in toggle: ', data)

    // if (e.target.checked === true) {
    //   sendDataBacktoHome(data)
    // } else {
    //   sendDataBacktoHome(data)
    // }
    sendDataBacktoHome(data)
    setSwitchState(!switchState)
  }
  return (
    <>
    <div className="d-flex flex-wrap no-gutters mb-4 pr-0 pl-0">
      {categories.map((item, index) => (
        <Form key={index} className='me-2'>
          <Form.Check
            type='switch'
            id='custom-switch'
            label={item}
            defaultChecked={switchState}
            onChange={e => handleChange(e, item)}
          />
        </Form>
      ))}
      </div>
    </>
  )
}

export default Toggles
