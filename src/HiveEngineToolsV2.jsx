import React from 'react';
import HiveEngineAPI from './HiveEngineAPI.js';
import './HiveEngineToolsV2.scss';
import store from 'store/dist/store.modern';
import Since from './better-since.jsx';
import MUIDataTable from "mui-datatables";

const HiveEngine = new HiveEngineAPI();

class HiveEngineToolsV2 extends React.Component {
  constructor(props) {
    super(props);

    this.pageData = {
      "/delegations": {
        "title": "Delegations"
      },
      "/markets": {
        "title": "Markets"
      },
      "/users": {
        "title": "Users"
      },
      "/donate": {
          "title": "Donate"
      },
      "/": {
        "title": "Home"
      }
    };

    this.state = {
      path: window.location.pathname,
    };

    if (this.state.path !== "/") {
      if (this.pageData[this.state.path] !== undefined) {
        document.title = this.pageData[this.state.path]["title"] + " | Hive Engine Tools";
      }
    }
  }

  setPathFromLink(event, target_page = "") {
    if (target_page === "") {
      target_page = event.target.getAttribute("href");
    }
    if (this.pageData[target_page] !== undefined) {
      event.preventDefault();
      this.setState({"path": target_page});
      window.history.pushState(null, this.pageData[target_page] + " | Hive Engine Tools", target_page);
      document.title = this.pageData[target_page]["title"] + " | Hive Engine Tools";
    }
  }

  render ()
  {
    return (
        <React.Fragment>
          <header>
            <div className="header-logo" onClick={event => {this.setPathFromLink(event, "/")}}>
              <h1>Hive Engine Tools</h1>
              <p>Slightly More Tolerable Edition&trade;</p>
            </div>
            <div className="header-links">
              <div className="header-link"><a onClick={event => {this.setPathFromLink(event);}} href="/delegations">Delegations</a></div>
              <div className="header-link"><a onClick={event => {this.setPathFromLink(event);}} href="/markets">Markets</a></div>
              {/*<div className="header-link"><a onClick={event => {this.setPathFromLink(event);}} href="/users">Users</a></div>*/}
              {<div className="header-link"><a onClick={event => {this.setPathFromLink(event);}} href="/donate">Donate</a></div>}
            </div>
            <div className="header-expander"/>
          </header>
          <PageLoader url={this.state.path} pageData={this.pageData} />
          <footer>

          </footer>
        </React.Fragment>
    );
  }
}

class PageLoader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  renderPageFromProps() {
    switch(this.props.url) {
      case "/delegations":
        return (<DelegationsPage url={this.props.url} />);
      case "/markets":
        return (<MarketsPage url={this.props.url} />);
      case "/users":
        return (<UsersPage url={this.props.url} />);
      case "/":
        return (<HomePage url={this.props.url} />);
      case "/donate":
        return (<DonatePage url={this.props.url} />);
      default:
        return (<ErrorPage type="404" url={this.props.url} />);
    }
  }

  render () {
    return (
      <main className="App">
        {this.renderPageFromProps()}
      </main>
    );
  }
}

class Advertisement1 extends React.Component {
  constructor(props) {
    super(props);

    this.state = { shown: true };

    if (store.get("hidePrompt")) {
      if ((new Date(store.get("hidePrompt")[1])) > (new Date())) {
        this.state.shown = false;
      } else {
        store.remove("hidePrompt");
      }
    }
  }

  removeAd() {
    let date_expires = new Date();
    date_expires.setDate(date_expires.getDate() + 10);
    store.set("hidePrompt", [true, date_expires.toISOString()]);
    this.setState({"shown": false});
  }

  render() {
    if (this.state.shown) {
      return (
          <div className="display-unit">
            <p>Care to help support the project and keep it Advertisement & Subscription-free?</p>
            <div className="unit-expander"/>
            <button onClick={() => this.removeAd()}>No, Thanks</button>
            <a href="/donate">Donate</a>
            <a href="https://vote.hive.uno" target="_blank" rel="noopener noreferrer">Vote @CADawg Witness</a>
          </div>
      );
    } else {
      return "";
    }
  }
}

function HomePage(props) {
  return (
    <div className="container">
      <h2 className="thin-text">Welcome to Hive Engine Tools</h2>
      <p>This is an improved version of <a href="https://steem.tools/steemengine" rel="nofollow">SE Tools</a>, which should act and feel faster than the classic version of this. Also, it no longer runs on Steemy&trade; so that's an improvement.</p>
      <h3 className="thin-text">Built by <a href="https://peakd.com/@cadawg" rel="nofollow">@cadawg</a>.</h3>
      <Advertisement1/>
    </div>
  )
}

class MarketsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {"marketBuyData": [], "marketSellData": []};
    this.reloadButtonRef = React.createRef();
  }

  // Runs on page load only - set initial delegations
  componentDidMount = async () => {
    await this.reloadData();
  };

  async reloadData() {
    let event_target = this.reloadButtonRef.current || false;
    if (event_target !== false) {
      event_target.innerHTML = "Reloading...";
      event_target.disabled = true;
    }
    let marketBuys = await HiveEngine.getMarketBuys();
    console.log(marketBuys);
    let marketSells = await HiveEngine.getMarketSells();
    this.setState({marketBuyData: marketBuys, marketSellData: marketSells});
    let offset_market_buys = 1000;
    while (marketBuys.length >= 1000) {
      marketBuys = await HiveEngine.getMarketBuys("","", offset_market_buys);
      offset_market_buys += 1000;
      this.setState({marketBuyData: this.state.marketBuyData.concat(marketBuys)});
    }
    let offset_market_sells = 1000;
    while (marketSells.length >= 1000) {
      marketSells = await HiveEngine.getMarketSells("","", offset_market_sells);
      offset_market_sells += 1000;
      this.setState({marketSellData: this.state.marketSellData.concat(marketSells)});
    }
    if (event_target !== false) {
      event_target.innerHTML = "Reload Data";
      event_target.disabled = false;
    }
  }


  render() {
    const buys_columns = [
      {name: "account", label: "Account", options: {filterType: "textField"}},
      {name: "price", label: "Price", options: {filter: false}},
      {
        name: "quantity",
        label: "Quantity",
        options:
            {customBodyRender: (value) => {
                let remove_zeros = Number.parseFloat(value);
                return remove_zeros.toString();
              }, filter: false}
      },
      {name: "symbol", label: "Asset"},
      {
        name: "tokensLocked",
        label: "Hive Value",
        options:
            {customBodyRender: (value) => {
                let remove_zeros = Number.parseFloat(value);
                return remove_zeros.toString();
              }, filter: false}
      },
      {
        name: "timestamp",
        label: "Submitted",
        options:
            {customBodyRender: (value) => {
                let updated_time = new Date(0);
                updated_time.setUTCSeconds(value);
                return (<Since date={updated_time} />);
              }, filter: false}
      },{
        name: "expiration",
        label: "Expires",
        options:
            {customBodyRender: (value) => {
                let updated_time = new Date(0);
                updated_time.setUTCSeconds(value);
                return (<Since date={updated_time} />);
              }, filter: false}
      }];

    console.log(this.state.marketBuyData);

    const sells_columns = [{name: "account", label: "Account", options: {filterType: "textField"}},
      {name: "price", label: "Price", options: {filter: false}},
      {
        name: "quantity",
        label: "Quantity",
        options:
            {customBodyRender: (value) => {
                let remove_zeros = Number.parseFloat(value);
                return remove_zeros.toString();
              }, filter: false}
      },
      {name: "symbol", label: "Asset"},
      {
        name: "timestamp",
        label: "Submitted",
        options:
            {customBodyRender: (value) => {
                let updated_time = new Date(0);
                updated_time.setUTCSeconds(value);
                return (<Since date={updated_time} />);
              }, filter: false}
      },{
        name: "expiration",
        label: "Expires",
        options:
            {customBodyRender: (value) => {
                let updated_time = new Date(0);
                updated_time.setUTCSeconds(value);
                return (<Since date={updated_time} />);
              }, filter: false}
      }];

    return (
        <div className="container">
          <button className="data_reload_button" ref={this.reloadButtonRef} onClick={async () => {await this.reloadData()}}>Reload Data</button>
          <Advertisement1/>
          <MUIDataTable
              title="Market Buys"
              data={this.state.marketBuyData}
              columns={buys_columns}
              options={{filterType: "checkbox", rowsPerPageOptions: [5,10,25,50,100]}}
          />
          <br/>
          <MUIDataTable
              title="Market Sells"
              data={this.state.marketSellData}
              columns={sells_columns}
              options={{filterType: "checkbox", rowsPerPageOptions: [5,10,25,50,100]}}
          />
        </div>
    );
  }
}


class DonatePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
        <div className="container">
          <h1>Donate</h1>
          <ul>
            <li>Hive</li>
            <ul>
              <li>Upvote <a href="https://peakd.com/@cadawg">@cadawg</a></li>
              <li>Send HIVE/HBD to <a href="https://peakd.com/@cadawg">@cadawg</a></li>
              <li>Send HIVE-Engine Tokens To <a href="https://peakd.com/@cadawg">@cadawg</a></li>
            </ul>
            <li>CryptoCurrency</li>
            <ul>
              <li>Send <strong>Bitcoin</strong> to <code><strong>3QyYGjpdG3S46igUQztK1HZvKAX88ovbbA</strong></code></li>
              <li>Send <strong>Bitcoin Cash</strong> to <code><strong>qzeyn5n6ee7zq9usj2yeg4e8mn7zcvznjc3rswyms8</strong></code></li>
              <li>Send <strong>Litecoin</strong> to <code><strong>M9EECoKaWQDBbF8ewxAjd5szBezn4xFZoc</strong></code>
              </li>
              <li>Send <strong>Dogecoin</strong> to <code><strong>D8azPUdR69UMZnayGKM6W6RdfqvBhCaFaN</strong></code>
              </li>
              <li>Send <strong>DASH</strong> to <code><strong>XmiVsrdkY65n9V6Xzft5xwJjU9Zf21aPsk</strong></code></li>
              <li>Send <strong>Ethereum</strong> to <code><strong>0x96248d59156789620805462B8786C4EB5a873adB</strong></code>
              </li>
              <li>Send <strong>Ethereum Classic</strong> to <code><strong>0xDe0739F22cc190982Df202ee51ab029A51212433</strong></code></li>
            </ul>
          </ul>
        </div>
    );
  }
}

function UsersPage(props) {
  return (
      <h1>404, That's an error.</h1>
  );
}

class DelegationsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {"delegationData": [], "undelegationData": []};
    this.reloadButtonRef = React.createRef();
  }

  // Runs on page load only - set initial delegations
  componentDidMount = async () => {
    await this.reloadData();
  };

  async reloadData() {
    let event_target = this.reloadButtonRef.current || false;
    if (event_target !== false) {
      event_target.innerHTML = "Reloading...";
      event_target.disabled = true;
    }
    let delegations = await HiveEngine.getDelegations();
    let undelegations = await HiveEngine.getUndelegations();
    this.setState({marketBuyData: delegations, marketSellData: undelegations});
    let offset_delegations = 1000;
    while (delegations.length >= 1000) {
      delegations = await HiveEngine.getDelegations({}, offset_delegations);
      offset_delegations += 1000;
      this.setState({marketBuyData: this.state.marketBuyData.concat(delegations)});
    }
    let offset_undelegations = 1000;
    while (undelegations.length >= 1000) {
      undelegations = await HiveEngine.getDelegations({}, offset_undelegations);
      offset_undelegations += 1000;
      this.setState({marketSellData: this.state.marketSellData.concat(undelegations)});
    }
    if (event_target !== false) {
      event_target.innerHTML = "Reload Data";
      event_target.disabled = false;
    }
  }


  render() {
    const delegations_columns = [
      {name: "from", label: "From", options: {filterType: "textField"}},
      {name: "to", label: "To", options: {filterType: "textField"}},
      {name: "quantity", label: "Amount", options: {filter: false}},
      {name: "symbol", label: "Asset"},
      {
        name: "created",
        label: "Created",
        options:
            {customBodyRender: (value) => {
                let updated_time = new Date(0);
                updated_time.setUTCMilliseconds(value);
                return (<Since date={updated_time} />);
              }, filter: false}
      },
      {
        name: "updated",
        label: "Updated",
        options:
            {customBodyRender: (value) => {
              let updated_time = new Date(0);
              updated_time.setUTCMilliseconds(value);
              return (<Since date={updated_time} />);
              }, filter: false}
        }];

    console.log(this.state.marketSellData);

    const undelegations_columns = [
      {name: "account", label: "From", options: {filterType: "textField"}},
      {name: "quantity", label: "Amount", options: {filter: false}},
      {name: "symbol", label: "Asset"},
      {
        name: "completeTimestamp",
        label: "Returned",
        options:
            {customBodyRender: (value) => {
                let updated_time = new Date(0);
                updated_time.setUTCMilliseconds(value);
                return (<Since date={updated_time} />);
              }, filter: false}
      }];

    return (
        <div className="container">
          <button className="data_reload_button" ref={this.reloadButtonRef} onClick={async () => {await this.reloadData()}}>Reload Data</button>
          <Advertisement1/>
          <MUIDataTable
              title="Delegations"
              data={this.state.marketBuyData}
              columns={delegations_columns}
              options={{filterType: "checkbox", rowsPerPageOptions: [5,10,25,50,100]}}
          />
          <br/>
          <MUIDataTable
              title="Undelegations"
              data={this.state.marketSellData}
              columns={undelegations_columns}
              options={{filterType: "checkbox", rowsPerPageOptions: [5,10,25,50,100]}}
          />
        </div>
    );
  }
}

function ErrorPage(props) {
  return (
    <div className="container">
      <h1>{props.type}, That's an error.</h1>
      <h2>The Requested URL {props.url} wasn't found on this server.</h2>
      <h3>Oh noes! What did you do to the poor Server? (╯°Д°)╯︵/(.□ . \)</h3>
    </div>
  );
}

export default HiveEngineToolsV2;
