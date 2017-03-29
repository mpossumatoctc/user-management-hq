import React from 'react';

class TextComponent extends React.Component {
    render() {
        const { source, property, ...otherProps } = this.props;
        return (<div {...otherProps}>{property}</div>);
    }
}

export default TextComponent;
