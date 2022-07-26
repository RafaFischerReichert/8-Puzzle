if (!String.prototype.splice) {
  /**
   * {JSDoc}
   *
   * O método splice() muda o conteúdod e uma string removendo um grupo de
   * caracteres e/ou adicionando novos caracteres.
   *
   * @this {String}
   * @param {number} start Índice no qual a mudança começa.
   * @param {number} delCount Inteiro que indica quantos caracteres remover.
   * @param {string} newSubStr A String que é inserida.
   * @return {string} Uma nova string com a substring inserida.
   */
  String.prototype.splice = function (start, delCount, newSubStr) {
    return (
      this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount))
    );
  };
}
