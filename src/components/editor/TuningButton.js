import React, { Component } from 'react';
import { connect } from 'react-redux';
import { head, last } from 'lodash';
import Popover from 'react-popover-fork';

import { tuningSelector } from '../../util/selectors';
import HoverableText from './HoverableText';
import hover from './hoverContainer';
import { changeTuning } from '../../actions/track';
import { nextNote, previousNote, previousOctave, nextOctave } from '../../util/midiNotes';

const popoverStyle = {
  zIndex: 5,
  fill: '#FEFBF7',
  marginLeft: 0
};

const flexStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginRight: 5
};

const textInputStyle = {
  fontFamily: 'Optima, Segoe, Segoe UI, Candara, Calibri, Arial, sans-serif',
  marginTop: 5, marginBottom: 5, marginLeft: 5, marginRight: 5, width: 25
};

const TuningIcon = hover()(({ style, onClick, color}) => (
  <svg onClick={onClick} width={60} height={50} style={style}>
    <path fill={color} d='M4.416 21.77c-1.058 0-1.916.858-1.916 1.916v3.704c0 1.058.858 1.917 1.916 1.917 1.058 0 1.916-.858 1.916-1.917v-.468h2.652v1.906c0 .575.367 1.328.82 1.683l5.355 4.185v7.07h9.42v-7.16l5.347-4.102c.457-.35.827-1.1.827-1.675v-1.906h2.65v.468c0 1.058.86 1.917 1.918 1.917 1.058 0 1.916-.858 1.916-1.917v-3.704c0-1.058-.858-1.916-1.916-1.916-1.058 0-1.917.858-1.917 1.916v.57h-2.65v-8.52h2.65v.568c0 1.058.86 1.917 1.917 1.917 1.058 0 1.916-.857 1.916-1.916V12.6c0-1.058-.858-1.916-1.916-1.916-1.058 0-1.917.858-1.917 1.916v.47h-2.65V8.678c0-.575-.43-.855-.955-.624l-9.01 3.945c-.528.23-1.383.23-1.91-.002l-8.943-3.94c-.527-.233-.953.046-.953.62v4.395H6.332v-.47c0-1.058-.858-1.916-1.916-1.916-1.058 0-1.916.858-1.916 1.916v3.705c0 1.058.858 1.916 1.916 1.916 1.058 0 1.916-.857 1.916-1.915v-.57h2.652v8.523H6.332v-.572c0-1.058-.858-1.916-1.916-1.916z' />
  </svg>
));

class TuningStringInput extends Component {
  constructor() {
    super();

    this.removeString = this.removeString.bind(this);
    this.onTextChanged = this.onTextChanged.bind(this);
    this.setRef = this.setRef.bind(this);
  }

  componentDidMount() {
    if(this.props.index === 0) {
      this.input.select();
    }
  }

  removeString() {
    this.props.removeString(this.props.index);
  }

  midiStringFromKeyCode(string, keyCode, shiftKey) {
    switch(keyCode) {
      case 37:
        return previousNote(string);
      case 38:
        return nextOctave(string);
      case 39:
        return nextNote(string);
      case 40:
        return previousOctave(string);
      default: {
        if(keyCode === 51 && shiftKey) {
          if(string[0] !== 'e' && string[0] !== 'b' && string.length === 2) {
            return string[0] + '#' + string[1];
          }
        } else if(keyCode >= 48 && keyCode <= 57) {
          return string[0] + (keyCode - 48);
        } else if(keyCode >= 65 && keyCode <= 71) {
          return String.fromCharCode(keyCode).toLowerCase() + last(string.split(''));
        }
        return string;
      }
    }
  }

  onTextChanged(e) {
    const newString = this.midiStringFromKeyCode(this.props.string, e.keyCode, e.shiftKey);
    if(newString !== this.props.string) {
      this.props.onChange(newString, this.props.index);
    }
  }

  noop() { /* this exists to make React happy */ }

  setRef(el) {
    this.input = el;
  }

  render() {
    return (
      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input style={textInputStyle} type='text' size={2} value={this.props.string}
          onChange={this.noop} onKeyDown={this.onTextChanged} ref={this.setRef} />
        <HoverableText onClick={this.removeString} text='x' style={{ fontWeight: 600 }} />
      </span>
    );
  }
}

class TuningPopover extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tuning: [].concat(props.tuning)
    };

    this.removeString = this.removeString.bind(this);
    this.incrementAllStrings = this.incrementAllStrings.bind(this);
    this.decrementAllStrings = this.decrementAllStrings.bind(this);
    this.addTopString = this.addTopString.bind(this);
    this.addBottomString = this.addBottomString.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentWillUnmount() {
    this.props.changeTuning(this.state.tuning);
  }

  removeString(index) {
    this.setState({ tuning: this.state.tuning.filter((_, i) => i !== this.state.tuning.length - 1 - index) });
  }

  incrementAllStrings() {
    this.setState({ tuning: this.state.tuning.map(nextNote) });
  }

  decrementAllStrings() {
    this.setState({ tuning: this.state.tuning.map(previousNote) });
  }

  addTopString() {
    this.setState({ tuning: this.state.tuning.concat(last(this.state.tuning)) });
  }

  addBottomString() {
    this.setState({ tuning: [head(this.state.tuning)].concat(this.state.tuning) });
  }

  onChange(newString, i) {
    const { tuning } = this.state;
    const { length } = tuning;
    const newTuning = tuning.slice(0, length - 1 - i).concat(newString).concat(tuning.slice(length - i, length));
    this.setState({ tuning: newTuning });
  }

  render() {
    const { tuning } = this.state;

    const tuningInputs = tuning.slice(0).reverse().map((string, i) => (
      <TuningStringInput string={string} index={i}
        key={i} onChange={this.onChange} removeString={this.removeString} />
    ));

    return (
      <div style={{ display: 'flex', flexDirection: 'row', background: '#FEFBF7' }}>
        <span style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: 5 }}>
          <HoverableText onClick={this.incrementAllStrings} text='&#9650;'/>
          <HoverableText onClick={this.decrementAllStrings} text='&#9660;'/>
        </span>
        <div style={flexStyle}>
          <HoverableText onClick={this.addTopString} text='+' style={{ fontWeight: 800 }}/>
          {tuningInputs}
          <HoverableText onClick={this.addBottomString} text='+' style={{ fontWeight: 800 }}/>
        </div>
      </div>
    );
  }
}
const ConnectedPopover = connect(null, { changeTuning })(TuningPopover);

class TuningButton extends Component {
  constructor() {
    super();

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onPopoverClose = this.onPopoverClose.bind(this);

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyPress);
    }

    this.state = {
      popoverOpen: false
    };
  }

  componentWillUnmount() {
    window.removeEventListener('keywdown', this.handleKeyPress);
  }

  handleKeyPress(e) {
    if(this.state.popoverOpen) {
      if(e.keyCode === 13) { // enter
        this.onPopoverClose();
      } else if(e.keyCode === 27) { // escape
        // TODO make this cancel the tuning change instead of updating it
        this.onPopoverClose();
      } else if(e.keyCode === 37 || e.keyCode === 39) { // left/right arrow
        e.preventDefault();
      }
    }
  }

  onClick() {
    if(this.state.popoverOpen) {
      this.onPopoverClose();
    } else {
      this.props.onClick();
      this.setState({ popoverOpen: true });
    }
  }

  onPopoverClose() {
    this.setState({ popoverOpen: false });
    this.props.onClose();
  }

  render() {
    const { style, color, tuning } = this.props;
    const body = <ConnectedPopover tuning={tuning}  />;

    return (
      <div>
        <Popover preferPlace='right' style={popoverStyle} isOpen={this.state.popoverOpen}
          onOuterAction={this.onPopoverClose} body={body}>
          <TuningIcon onClick={this.onClick} style={style} color={color} />
        </Popover>
      </div>
    );
  }
}

export default connect(state => ({ tuning: tuningSelector(state) }))(TuningButton);
