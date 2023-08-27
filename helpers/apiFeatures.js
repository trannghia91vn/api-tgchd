//Bao gồm các tính năng sau khi query find như sau:
// filter bình thường theo props cần
//query theo tính năng : sort, fields, limit, page

class QueriesResource {
  constructor(queried, reqQueries) {
    this.queried = queried;
    this.reqQueries = reqQueries;
  }
  filter() {
    const specialQuery = ["sort", "fields", "page", "limit"];
    const cloneReqQueries = { ...this.reqQueries };
    //Loại bỏ các key query đặc biệt nếu có
    specialQuery.forEach((item) => {
      delete cloneReqQueries[item];
    });

    //Nâng cao phần filter trong khoảng giá trị
    let reqQueriedString = JSON.stringify(cloneReqQueries);
    reqQueriedString = reqQueriedString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );
    reqQueriedString = JSON.parse(reqQueriedString);

    //Giả sử query như sau ?price=8,name="tèo"
    this.queried = this.queried.find(reqQueriedString);
    return this;
  }
  sort() {
    if (this.reqQueries.sort) {
      const sortValue = this.reqQueries.sort.split(",");
      const sortString = sortValue.join(" ");
      this.queried = this.queried.sort(sortString);
      return this;
    }
  }
  fields() {
    if (this.reqQueries.fields) {
      const fieldValues = this.reqQueries.fields.split(",");
      const fieldsString = fieldValues.join(" ");
      this.queried = this.queried.select(fieldsString);
      return this;
    }
  }
  pagination() {
    if (this.reqQueries.page && this.reqQueries.limit) {
      const reqPage = this.reqQueries.page || 1;
      const itemsPerPage = this.reqQueries.limit || 100;
      const skippedItems = (reqPage - 1) * itemsPerPage;
      this.queried = this.queried.skip(skippedItems).limit(itemsPerPage);
      return this;
    }
  }
}

module.exports = QueriesResource;
