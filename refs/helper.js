exports.QueriedResoure = class {
  constructor(queried, reqObjQuery) {
    this.queried = queried; //Thằng này là resource đã được query từ mongoose
    this.reqObjQuery = reqObjQuery;
  }
  filter() {
    const specialQueries = ["sort", "page", "limit", "fields"];
    const objQuery = { ...this.reqObjQuery };
    specialQueries.forEach((item) => {
      delete objQuery[item];
    });
    console.log(objQuery);
    this.queried = this.queried.find(objQuery);
    return this;
  }
  sort() {
    if (this.reqObjQuery.sort) {
      const sortVal = this.reqObjQuery.sort;
      const sortCondition = sortVal.split(",").join(" ");
      this.queried.sort(sortCondition);
    }
    return this;
  }
  fields() {
    if (this.reqObjQuery.fields) {
      const fieldsCondition = this.reqObjQuery.fields.split(",").join(" ");
      this.queried.select(fieldsCondition);
    }
    return this;
  }
  pagination(totalPages) {
    if (this.reqObjQuery.page || this.reqObjQuery.limit) {
      const curPage = +this.reqObjQuery.page || 1;
      const itemsPerPage = +this.reqObjQuery.limit || 100;
      const amountSkip = (curPage - 1) * itemsPerPage;
      if (curPage > +totalPages) {
        throw new Error("Trang không tồn tại bồ tèo ơi.");
      }
      this.queried.skip(amountSkip).limit(itemsPerPage);
    }
    return this;
  }
};
