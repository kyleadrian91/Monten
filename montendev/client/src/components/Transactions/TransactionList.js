import _ from "lodash";
import React, { Component } from "react";
import { connect } from "react-redux";
import TransactionItem from "./TransactionItem";
import Spinner from "../Spinner";
import { fetchTransactions } from "../../actions";
import Pagination from "../Pagination";
import requireAuth from "../../requireAuth";

// DON'T FORGET TO SPECIFY THIS. WHEN CALLING FUNCTIONS

let direction = "asc";

class TransactionList extends Component {
  state = {
    currentTransactions: [],
    currentPage: null,
    totalPages: null,
    searchTerm: "",
    filteredTransactions: undefined
  };

  componentWillMount() {
    if (this.props.match.params.category) {
      let filteredTransactions = [];

      this.props.transactions.forEach(transaction => {
        if (
          transaction.category
            .toLowerCase()
            .includes(this.props.match.params.category.toLowerCase())
        )
          filteredTransactions.push(transaction);
      });

      this.setState({ filteredTransactions });
    }
  }

  componentDidMount() {
    this.props.fetchTransactions();
  }

  onPageChanged = data => {
    const { transactions } = this.props;

    const { currentPage, totalPages, pageLimit } = data;

    //The offset value indicates the starting index for fetching the records for the current page. Using (currentPage - 1) ensures that the offset is zero-based.
    const offset = (currentPage - 1) * pageLimit;
    // We use the Array.prototype.slice() method to extract the required chunk of records from allCountries by passing the offset as the starting index for the slice
    // and (offset + pageLimit) as the index before which to end the slice.
    const currentTransactions = transactions.slice(offset, offset + pageLimit);

    this.setState({
      currentPage,
      currentTransactions,
      totalPages
    });
  };

  handleSort = key => {
    const changeDirection = () => {
      if (direction === "asc") {
        direction = "desc";
      } else if (direction === "desc") {
        direction = "asc";
        return;
      }
    };

    changeDirection();

    const { currentTransactions } = this.state;
    const sortedArray = _.orderBy(currentTransactions, [key], [direction]);
    this.setState({ currentTransactions: sortedArray });
  };

  handleSearchInput = event => {
    this.setState({ searchTerm: event.target.value });
    this.filterTransactions();
  };

  filterTransactions() {
    let filteredTransactions = [];
    this.props.transactions.forEach(transaction => {
      if (
        transaction.description
          .toLowerCase()
          .includes(this.state.searchTerm.toLowerCase()) ||
        transaction.category
          .toLowerCase()
          .includes(this.state.searchTerm.toLowerCase())
      )
        filteredTransactions.push(transaction);
    });

    this.setState({ filteredTransactions });
  }

  renderAllTransactions = () => {
    if (this.props.match.params.category) {
      const { filteredTransactions } = this.state;

      return filteredTransactions.map(
        ({ date, description, category, amount, _id }) => {
          return (
            <TransactionItem
              date={date}
              description={description}
              category={category}
              amount={amount}
              key={_id}
              id={_id}
            />
          );
        }
      );
    }

    const { currentTransactions } = this.state;

    return currentTransactions.map(
      ({ date, description, category, amount, _id }) => {
        return (
          <TransactionItem
            date={date}
            description={description}
            category={category}
            amount={amount}
            key={_id}
            id={_id}
          />
        );
      }
    );
  };

  renderFilteredTransactions = () => {
    const { filteredTransactions } = this.state;

    if (filteredTransactions.length === 0) {
      return <h1 style={{ textAlign: "center" }}>No Transactions Found :(</h1>;
    }

    return filteredTransactions.map(
      ({ date, description, category, amount, _id }) => {
        return (
          <TransactionItem
            date={date}
            description={description}
            category={category}
            amount={amount}
            key={_id}
            id={_id}
          />
        );
      }
    );
  };

  render() {
    const totalTransactions = this.props.transactions.length;

    if (totalTransactions === 0) {
      return <Spinner sectionName={"Transaction List"} />;
    }

    return (
      <div>
        <div className="ui grid">
          <div className="left floated four wide column">
            <h2 style={{ marginTop: "10px" }}>
              <strong className="text-secondary">{totalTransactions}</strong>
              &nbsp; Transactions
            </h2>
          </div>
          <div className="right floated four wide column">
            <div className="ui search" style={{ marginTop: "10px" }}>
              <div className="ui icon input">
                <input
                  className="prompt"
                  type="text"
                  placeholder="Search transactions..."
                  onChange={this.handleSearchInput}
                />
                <i className="search icon" />
              </div>
            </div>
          </div>
        </div>
        <table className="ui celled table">
          <thead>
            <tr>
              <th onClick={() => this.handleSort("date")}>Date</th>
              <th onClick={() => this.handleSort("description")}>
                Description
              </th>
              <th onClick={() => this.handleSort("category")}>Category</th>
              <th onClick={() => this.handleSort("amount")}>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.state.searchTerm
              ? this.renderFilteredTransactions()
              : this.renderAllTransactions()}
          </tbody>
        </table>
        <div>
          <Pagination
            totalRecords={totalTransactions}
            pageLimit={10}
            pageNeighbours={1}
            onPageChanged={this.onPageChanged}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    transactions: Object.values(state.transactions)
  };
};

export default connect(
  mapStateToProps,
  { fetchTransactions }
)(requireAuth(TransactionList));
