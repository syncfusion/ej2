/**
 * TreeMap e2e testing
 */
import { browser, element, By, by } from "@syncfusion/ej2-base/e2e/index";
import { WebElement, Options } from "selenium-webdriver";
import { Property } from "@syncfusion/ej2-base";



describe('TreeMap component test spec', () => {
    it('TreeMap label template', () => {
        browser.get(browser.basePath + '/demo/custom.html');
        browser.compareScreen(element(By.id('container')), 'label_template');
    });
});
