import React, { useState } from 'react';

type CheckBoxProps = {
    text: string
    id: string
    isChecked: boolean
    onCheckboxChange: (id: string) => void
}
const Checkbox = (props: CheckBoxProps) => {
    const {text, id, isChecked, onCheckboxChange} = props
    const [checked, setIsChecked] = useState(isChecked);

    const handleCheckboxChange = () => {
        setIsChecked(!checked);
        onCheckboxChange(id)
    };

    return (
        <div>
            <label>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={handleCheckboxChange}
                />
                {checked + id}
            </label>
        </div>
    );
};

export default Checkbox;
