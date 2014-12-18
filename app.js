(function() {

  return {
    defaultState: 'links',
    events: {
      'app.activated':'doSomething',
      'click .copy_link':'copyLink',
      'click .copy_embed':'copyEmbed',
      'click .copy_linked_embed':'copyLinkedEmbed'
    },

    doSomething: function() {

    },
    copyLink: function() {
      var src = this.$('.source').val();
      var markdown = helpers.fmt('[%@](%@)', src, src);
      this.pasteComment(markdown);
    },
    copyEmbed: function() {
      var src = this.$('.source').val();
      var markdown = helpers.fmt('![](%@)', src);
      this.pasteComment(markdown);
    },
    copyLinkedEmbed: function() {
      var src = this.$('.source').val();
      var markdown = helpers.fmt('[![](%@)](%@)', src, src);
      this.pasteComment(markdown);
    },
    pasteComment: function(markdown) {
      var existingComment = this.comment().text();
      if (!existingComment) {
        this.comment().text(markdown);
      } else {
        this.comment().text(existingComment + '\n\n' + markdown);
      }
    }
  };

}());
