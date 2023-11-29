function KkdPffHydrogenFee() {

  this.DEFAULT_PERCENTAGE = 0.015;
  this.DEFAULT_ADDITIONAL_CHARGE = 10000;
  this.DEFAULT_THRESHOLD = 250000;
  this.DEFAULT_CAP = 200000;

  this.__initialize = function () {

    this.percentage = this.DEFAULT_PERCENTAGE;
    this.additional_charge = this.DEFAULT_ADDITIONAL_CHARGE;
    this.threshold = this.DEFAULT_THRESHOLD;
    this.cap = this.DEFAULT_CAP;

    if (window && window.KKD_HYDROGEN_CHARGE_SETTINGS) {
      this.percentage = window.KKD_HYDROGEN_CHARGE_SETTINGS.percentage;
      this.additional_charge = window.KKD_HYDROGEN_CHARGE_SETTINGS.additional_charge;
      this.threshold = window.KKD_HYDROGEN_CHARGE_SETTINGS.threshold;
      this.cap = window.KKD_HYDROGEN_CHARGE_SETTINGS.cap;
    }

  }

  this.chargeDivider = 0;
  this.crossover = 0;
  this.flatlinePlusCharge = 0;
  this.flatline = 0;

  this.withPercentage = function (percentage) {
    this.percentage = percentage;
    this.__setup();
  };

  this.withAdditionalCharge = function (additional_charge) {
    this.additional_charge = additional_charge;
    this.__setup();
  };

  this.withThreshold = function (threshold) {
    this.threshold = threshold;
    this.__setup();
  };

  this.withCap = function (cap) {
    this.cap = cap;
    this.__setup();
  };

  this.__setup = function () {
    this.__initialize();
    this.chargeDivider = this.__chargeDivider();
    this.crossover = this.__crossover();
    this.flatlinePlusCharge = this.__flatlinePlusCharge();
    this.flatline = this.__flatline();
  };

  this.__chargeDivider = function () {
    return 1 - this.percentage;
  };

  this.__crossover = function () {
    return this.threshold * this.chargeDivider - this.additional_charge;
  };

  this.__flatlinePlusCharge = function () {
    return (this.cap - this.additional_charge) / this.percentage;
  };

  this.__flatline = function () {
    return this.flatlinePlusCharge - this.cap;
  };

  this.addFor = function (amountinkobo) {
    if (amountinkobo > this.flatline) {
      return parseInt(Math.round(amountinkobo + this.cap));
    } else if (amountinkobo > this.crossover) {
      return parseInt(
        Math.round((amountinkobo + this.additional_charge) / this.chargeDivider)
      );
    } else {
      return parseInt(Math.round(amountinkobo / this.chargeDivider));
    }
  };

  this.__setup = function () {
    this.chargeDivider = this.__chargeDivider();
    this.crossover = this.__crossover();
    this.flatlinePlusCharge = this.__flatlinePlusCharge();
    this.flatline = this.__flatline();
  };

  this.__setup();
}

(function ($) {
  "use strict";
  $(document).ready(function ($) {
    $(function () {
      $(".date-picker").datepicker({
        dateFormat: "mm/dd/yy",
        prevText: '<i class="fa fa-caret-left"></i>',
        nextText: '<i class="fa fa-caret-right"></i>'
      });
    });
    if ($("#pf-vamount").length) {
      var amountField = $("#pf-vamount");
      calculateTotal();
    } else {
      var amountField = $("#pf-amount");
    }
    var max = 10;
    amountField.keydown(function (e) {
      format_validate(max, e);
    });

    amountField.keyup(function (e) {
      checkMinimumVal();
    });

    function checkMinimumVal() {
      if ($("#pf-minimum-hidden").length) {
        var min_amount = Number($("#pf-minimum-hidden").val());
        var amt = Number($("#pf-amount").val());
        if (min_amount > 0 && amt < min_amount) {
          $("#pf-min-val-warn").text(
            "Amount cannot be less than the minimum amount"
          );
          return false;
        } else {
          $("#pf-min-val-warn").text("");
          $("#pf-amount").removeClass("rerror");
        }
      }
    }

    function format_validate(max, e) {
      var value = amountField.text();
      if (e.which != 8 && value.length > max) {
        e.preventDefault();
      }
      // Allow: backspace, delete, tab, escape, enter and .
      if (
        $.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
        // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
        // Allow: Ctrl+C
        (e.keyCode == 67 && e.ctrlKey === true) ||
        // Allow: Ctrl+X
        (e.keyCode == 88 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)
      ) {
        // let it happen, don't do anything
        calculateFees();
        return;
      }
      // Ensure that it is a number and stop the keypress
      if (
        (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
        (e.keyCode < 96 || e.keyCode > 105)
      ) {
        e.preventDefault();
      } else {
        calculateFees();
      }
    }

    $.fn.digits = function () {
      return this.each(function () {
        $(this).text(
          $(this)
            .text()
            .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
        );
      });
    };

    function calculateTotal() {
      var unit;
      if ($("#pf-vamount").length) {
        unit = $("#hydrogen-form").find("#pf-vamount").val();
      } else {
        unit = $("#pf-amount").val();
      }
      var quant = $("#pf-quantity").val();
      var newvalue = unit * quant;

      if (quant == "" || quant == null) {
        quant = 1;
      } else {
        $("#pf-total").val(newvalue);
      }

    }
    function calculateFees(transaction_amount) {
      setTimeout(function () {
        transaction_amount = transaction_amount || parseInt(amountField.val());
        var currency = $("#pf-currency").val();
        var quant = $("#pf-quantity").val();
        if ($("#pf-vamount").length) {
          var name = $("#pf-vamount option:selected").attr("data-name");
          $("#pf-vname").val(name);
        }
        if (
          transaction_amount == "" ||
          transaction_amount == 0 ||
          transaction_amount.length == 0 ||
          transaction_amount == null ||
          isNaN(transaction_amount)
        ) {
          var total = 0;
          var fees = 0;
        } else {
          var obj = new KkdPffHydrogenFee();

          obj.withAdditionalCharge(kkd_pff_settings.fee.adc);
          obj.withThreshold(kkd_pff_settings.fee.ths);
          obj.withCap(kkd_pff_settings.fee.cap);
          obj.withPercentage(kkd_pff_settings.fee.prc);
          if (quant) {
            transaction_amount = transaction_amount * quant;
          }
          var total = obj.addFor(transaction_amount * 100) / 100;
          var fees = total - transaction_amount;
        }
        $(".pf-txncharge")
          .hide()
          .html(currency + " " + fees.toFixed(2))
          .show()
          .digits();
        $(".pf-txntotal")
          .hide()
          .html(currency + " " + total.toFixed(2))
          .show()
          .digits();
      }, 100);
    }

    calculateFees();

    $(".pf-number").keydown(function (event) {
      if (
        event.keyCode == 46 ||
        event.keyCode == 8 ||
        event.keyCode == 9 ||
        event.keyCode == 27 ||
        event.keyCode == 13 ||
        (event.keyCode == 65 && event.ctrlKey === true) ||
        (event.keyCode >= 35 && event.keyCode <= 39)
      ) {
        return;
      } else {
        if (
          event.shiftKey ||
          ((event.keyCode < 48 || event.keyCode > 57) &&
            (event.keyCode < 96 || event.keyCode > 105))
        ) {
          event.preventDefault();
        }
      }
    });
    if ($("#pf-quantity").length) {
      calculateTotal();
    };

    $("#pf-quantity, #pf-vamount, #pf-amount").on("change", function () {
      calculateTotal();
      calculateFees();
    });

    function validateEmail(email) {
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }

    // payment form for Hydrogen
    $(".hydrogen-form").on(
      "submit", function (e) {
          var requiredFieldIsInvalid = false;
          e.preventDefault();
    
          $("#pf-agreementicon").removeClass("rerror");
    
          $(this)
              .find("input, select, textarea")
              .each(
                  function () {
                      $(this).removeClass("rerror");
                  }
              );
          var email = $(this)
              .find("#pf-email")
              .val();
          var amount;
          if ($("#pf-vamount").length) {
              amount = $("#hydrogen-form").find("#pf-vamount").val();
              calculateTotal();
          } else {
              amount = $(this)
                  .find("#pf-amount")
                  .val();
          }
          if (Number(amount) > 0) {
          } else {
              $(this)
                  .find("#pf-amount,#pf-vamount")
                  .addClass("rerror");
              $("html,body").animate(
                  { scrollTop: $(".rerror").offset().top - 110 },
                  500
              );
              return false;
          }
          if (!validateEmail(email)) {
              $(this)
                  .find("#pf-email")
                  .addClass("rerror");
              $("html,body").animate(
                  { scrollTop: $(".rerror").offset().top - 110 },
                  500
              );
              return false;
          }
          if (checkMinimumVal() == false) {
              $(this)
                  .find("#pf-amount")
                  .addClass("rerror");
              $("html,body").animate(
                  { scrollTop: $(".rerror").offset().top - 110 },
                  500
              );
              return false;
          }
    
          $(this)
              .find("input, select, text, textarea")
              .filter("[required]")
              .filter(
                  function () {
                      return this.value === "";
                  }
              )
              .each(
                  function () {
                      $(this).addClass("rerror");
                      requiredFieldIsInvalid = true;
                  }
              );
    
          if ($("#pf-agreement").length && !$("#pf-agreement").is(":checked")) {
              $("#pf-agreementicon").addClass("rerror");
              requiredFieldIsInvalid = true;
          }
    
          if (requiredFieldIsInvalid) {
              $("html,body").animate(
                  { scrollTop: $(".rerror").offset().top - 110 },
                  500
              );
              return false;
          }
    
          var self = $(this);
          var $form = $(this);
    
          var formdata = new FormData(this);

          // console.log(formdata);
    
          $.ajax({
              url: $form.attr("action"),
              type: "POST",
              data: formdata,
              processData: false,
              contentType: false,
              dataType: "json",
              cache: false,
              success: function (data) {
                  // console.log(data.email);
                  data.custom_fields.push({
                      "display_name": "Plugin",
                      "variable_name": "plugin",
                      "value": "pff-hydrogen"
                  });
                  if (data.result === "success") {
                      var names = data.name.split(" ");
                      var firstName = names[0] || "";
                      var lastName = names[1] || "";
                      var quantity = data.quantity;
                      var amount = data.total;
                      var email = data.email;
                      var currency = data.currency;
                      var description = "Hydrogen PG via Wordpress Plugin Form";
                      var meta = firstName;
                      var callback = "https://dashboard.hydrogenpay.com/login";
    
                      // console.log(firstName);
                      // console.log(data.email);
                      // console.log(data.currency);
                      // console.log(data.total);
    
                      var curlData = {
                          "amount": amount,
                          "email": email,
                          "currency": currency,
                          "description": description,
                          "meta": meta,
                          "callback": callback
                      };
    
                      $.post($form.attr("action"), {
                          action: 'initiate_payment',
                          curlData: JSON.stringify(curlData),
                      }, function (response) {
                          if (response.statusCode === "90000") {
                              // console.log("Success Response Data: ", response);
                              openLinkModal(response.data.url);
                              // window.location.href = response.data.url;
                              // console.log("Success Response Data 1: ", response.data.url);
                          } else {
                              console.log("Error Message: ", response.message);
                          }
                      }, "json");
                  } else {
                      alert(data.message);
                  }
              },
              error: function (xhr, status, error) {
                  // console.log("An error occurred");
                  console.log("XHR: ", xhr);
                  console.log("Status: ", status);
                  console.log("Error: ", error);
              }
          });
    
    
          // Define the CSS style
    var customCSS = `
    <style>
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
        }
    
        .modal-container {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            max-width: 460px;
            z-index: 1001;
        }
    
        .custom-modal-body {
            padding: 0px;
        }
    
        .modal-logo {
            width: auto;
            height: 30px;
            margin-right: 10px;
        }
    </style>
    `;
    
    // Append the custom CSS to the head of the document
    $('head').append(customCSS);
    
    // Define the HTML for the modal overlay
    var overlayHTML = `
    <div class="modal-overlay"></div>
    `;
    
    // Append the modal overlay to the body
    $('body').append(overlayHTML);
    
    // Define the HTML for the modal
    var modalHTML = `
    <div class="modal-container">
        <div class="modal fade" id="linkModal" tabindex="-1" aria-labelledby="linkModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content max-w-460px">
                    <div class="modal-header">
                        <img src="https://qa-gateway.hydrogenpay.com/_next/static/media/Logo.9a9207a9.svg" alt="Logo" class="modal-logo">
                    </div>
                    <div class="modal-body custom-modal-body">
                        <iframe id="linkIframe" style="width: 100%; height: 400px; border: none;"></iframe>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary close" aria-label="Close">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Append the modal HTML to the body
    $('body').append(modalHTML);
    
    // Get a reference to the close button in the modal
    var closeButton = document.querySelector('.modal .close');
    
    // Get a reference to the "Close" button in the footer
    var closeFooterButton = document.querySelector('.modal-footer button');
    
    // Get a reference to the overlay element
    var overlay = document.querySelector('.modal-overlay');
    
    // Function to hide the modal and overlay
    function hideModal() {
    linkModal.style.display = 'none';
    overlay.style.display = 'none';
    location.reload(); // Refresh the page when the modal is closed
    }
    
    // Function to show the modal and overlay
    function showModal() {
    linkModal.style.display = 'block';
    overlay.style.display = 'block';
    }
    
    // Define a flag to track whether a modal is currently open
    var isModalOpen = false;
    
    // Function to open the modal and load the link
    function openLinkModal(linkUrl) {
    // Check if a modal is already open
    if (isModalOpen) {
        // Close the current modal
        hideModal();
    }
    
    // Set the flag to indicate that a modal is open
    isModalOpen = true;
    
    linkIframe.src = linkUrl;
    showModal(); // Show the modal and overlay
    }
    
    // Add a click event listener to the close button to hide the modal
    closeButton.addEventListener('click', hideModal);
    
    // Add a click event listener to the "Close" button in the footer to hide the modal
    closeFooterButton.addEventListener('click', hideModal);
    
    // Add a click event listener to the overlay to hide the modal
    overlay.addEventListener('click', hideModal);
    
    // Get a reference to the button that triggers opening the modal
    var openLinkButton = document.getElementById('openLinkButton');
    
    // Get a reference to the modal and iframe
    var linkModal = document.getElementById('linkModal');
    var linkIframe = document.getElementById('linkIframe');
    
    // Add a click event listener to the button
    openLinkButton.addEventListener('click', function () {
    // Pass the actual URL you want to open in the modal
    openLinkModal('linkUrl'); // Replace with the actual URL
    });
    
      }
    );
    
    
  });

})(jQuery);